package com.shopnow.service;

import com.shopnow.model.Commande;
import com.shopnow.model.LigneCommande;
import com.shopnow.model.Produit;
import com.shopnow.model.StatutCommande;
import com.shopnow.repository.CommandeRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Création et suivi des commandes.
 */
@Service
@Transactional
public class CommandeService {

    private final CommandeRepository commandeRepository;
    private final ProduitService produitService;

    public CommandeService(CommandeRepository commandeRepository, ProduitService produitService) {
        this.commandeRepository = commandeRepository;
        this.produitService = produitService;
    }

    /**
     * Crée une commande depuis un panier (map produitId → quantité).
     *
     * @param panier      contenu du panier
     * @param emailClient email de l'utilisateur connecté, ou null pour un achat invité
     * @return la commande créée (statut COMMANDE_CREEE)
     */
    public Commande creerCommande(Map<Long, Integer> panier, String emailClient) {
        if (panier == null || panier.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Panier vide");
        }
        List<LigneCommande> lignes = new ArrayList<>();
        panier.forEach((produitId, quantite) -> {
            if (quantite == null || quantite <= 0) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Quantité invalide pour le produit " + produitId);
            }
            Produit produit = produitService.obtenir(produitId);
            lignes.add(new LigneCommande(produit.getId(), produit.getNom(),
                    produit.getPrix(), quantite));
        });
        return commandeRepository.save(new Commande(emailClient, lignes));
    }

    public Commande obtenir(Long id) {
        return commandeRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Commande introuvable : " + id));
    }

    public List<Commande> lister() {
        return commandeRepository.findAll();
    }

    /**
     * Paiement simulé : accepte tout numéro de carte à 16 chiffres.
     */
    public Commande payer(Long commandeId, String numeroCarte) {
        if (numeroCarte == null || !numeroCarte.replaceAll("\\s", "").matches("\\d{16}")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Numéro de carte invalide (16 chiffres attendus)");
        }
        Commande commande = obtenir(commandeId);
        if (commande.getStatut() == StatutCommande.PAYEE) {
            return commande;
        }
        commande.setStatut(StatutCommande.PAYEE);
        return commandeRepository.save(commande);
    }
}
