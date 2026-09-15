package com.shopnow.web;

import com.shopnow.model.Commande;
import com.shopnow.model.Produit;
import com.shopnow.model.Utilisateur;
import com.shopnow.service.CommandeService;
import com.shopnow.service.ProduitService;
import com.shopnow.service.UtilisateurService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.HashMap;
import java.util.Map;

/**
 * Panier en session + commande + paiement simulé (parcours « invité » possible :
 * aucune connexion n'est requise pour acheter — pratique pour les tests E2E).
 */
@Controller
public class PanierController {

    public static final String CLE_PANIER = "panier";
    public static final String CLE_UTILISATEUR = "utilisateur";

    private final ProduitService produitService;
    private final CommandeService commandeService;
    private final UtilisateurService utilisateurService;

    public PanierController(ProduitService produitService, CommandeService commandeService,
                            UtilisateurService utilisateurService) {
        this.produitService = produitService;
        this.commandeService = commandeService;
        this.utilisateurService = utilisateurService;
    }

    /** Page panier : lignes détaillées + total. */
    @GetMapping("/panier")
    public String panier(HttpSession session, Model model) {
        Map<Long, Integer> panier = panierDe(session);
        Map<Produit, Integer> lignes = new HashMap<>();
        panier.forEach((id, qte) -> lignes.put(produitService.obtenir(id), qte));
        model.addAttribute("lignes", lignes);
        model.addAttribute("total", lignes.entrySet().stream()
                .map(e -> e.getKey().getPrix().multiply(java.math.BigDecimal.valueOf(e.getValue())))
                .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add));
        return "panier";
    }

    /** Ajout au panier depuis la fiche produit. */
    @PostMapping("/panier/ajouter/{id}")
    public String ajouter(@PathVariable Long id, HttpSession session) {
        Map<Long, Integer> panier = panierDe(session);
        panier.merge(id, 1, Integer::sum);
        session.setAttribute(CLE_PANIER, panier);
        return "redirect:/panier";
    }

    /** Modification de la quantité (depuis le panier). */
    @PostMapping("/panier/modifier/{id}")
    public String modifier(@PathVariable Long id, @RequestParam int quantite, HttpSession session) {
        Map<Long, Integer> panier = panierDe(session);
        if (quantite <= 0) {
            panier.remove(id);
        } else {
            panier.put(id, quantite);
        }
        session.setAttribute(CLE_PANIER, panier);
        return "redirect:/panier";
    }

    /** Suppression d'une ligne du panier. */
    @PostMapping("/panier/supprimer/{id}")
    public String supprimer(@PathVariable Long id, HttpSession session) {
        Map<Long, Integer> panier = panierDe(session);
        panier.remove(id);
        session.setAttribute(CLE_PANIER, panier);
        return "redirect:/panier";
    }

    /** Transformation du panier en commande (statut COMMANDE CRÉÉE), puis redirection. */
    @PostMapping("/commande/creer")
    public String creerCommande(HttpSession session, RedirectAttributes attrs) {
        Map<Long, Integer> panier = panierDe(session);
        String mail = session.getAttribute(CLE_UTILISATEUR) != null
                ? ((Utilisateur) session.getAttribute(CLE_UTILISATEUR)).getEmail() : null;
        Commande commande = commandeService.creerCommande(panier, mail);
        session.setAttribute(CLE_PANIER, new HashMap<Long, Integer>());
        return "redirect:/commande/" + commande.getId();
    }

    /** Confirmation de commande + paiement simulé. */
    @GetMapping("/commande/{id}")
    public String confirmation(@PathVariable Long id, Model model) {
        Commande commande = commandeService.obtenir(id);
        model.addAttribute("commande", commande);
        model.addAttribute("libelleStatut", ApiCommandesController.StatutLibelle.libelleDe(commande.getStatut()));
        return "commande";
    }

    /** Paiement simulé : carte à 16 chiffres → statut PAYÉE. */
    @PostMapping("/paiement/effectuer")
    public String payer(@RequestParam long commandeId, @RequestParam String numeroCarte,
                        RedirectAttributes attrs) {
        commandeService.payer(commandeId, numeroCarte);
        return "redirect:/commande/" + commandeId;
    }

    /* ---------- Comptes (pages) ---------- */

    @GetMapping("/connexion")
    public String pageConnexion() {
        return "connexion";
    }

    @GetMapping("/inscription")
    public String pageInscription() {
        return "inscription";
    }

    @PostMapping("/connexion")
    public String connexion(@RequestParam String email, @RequestParam String motDePasse,
                            HttpSession session, RedirectAttributes attrs) {
        return utilisateurService.connecter(email, motDePasse)
                .map(u -> {
                    session.setAttribute(CLE_UTILISATEUR, u);
                    return "redirect:/";
                })
                .orElseGet(() -> {
                    attrs.addFlashAttribute("erreur", "Identifiants invalides");
                    return "redirect:/connexion";
                });
    }

    @PostMapping("/inscription")
    public String inscription(@RequestParam String nom, @RequestParam String email,
                              @RequestParam String motDePasse, HttpSession session,
                              RedirectAttributes attrs) {
        try {
            Utilisateur utilisateur = utilisateurService.inscrire(nom, email, motDePasse);
            session.setAttribute(CLE_UTILISATEUR, utilisateur);
            return "redirect:/";
        } catch (RuntimeException e) {
            attrs.addFlashAttribute("erreur", e.getMessage());
            return "redirect:/inscription";
        }
    }

    @PostMapping("/deconnexion")
    public String deconnexion(HttpSession session) {
        session.invalidate();
        return "redirect:/";
    }

    @SuppressWarnings("unchecked")
    private Map<Long, Integer> panierDe(HttpSession session) {
        Object panier = session.getAttribute(CLE_PANIER);
        if (panier instanceof Map<?, ?> map) {
            return (Map<Long, Integer>) map;
        }
        return new HashMap<>();
    }
}
