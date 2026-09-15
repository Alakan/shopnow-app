package com.shopnow.web;

import com.shopnow.model.Commande;
import com.shopnow.model.StatutCommande;
import com.shopnow.service.CommandeService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.net.URI;
import java.util.List;
import java.util.Map;

/**
 * API REST des commandes — endpoint testé par la collection Postman/Newman du TP.
 */
@RestController
@RequestMapping("/api/commandes")
public class ApiCommandesController {

    private final CommandeService commandeService;

    public ApiCommandesController(CommandeService commandeService) {
        this.commandeService = commandeService;
    }

    /** POST /api/commandes — crée une commande depuis un panier {produitId → quantité}. */
    @PostMapping
    public ResponseEntity<Commande> creer(@RequestBody CreerCommandeRequete requete) {
        Commande commande = commandeService.creerCommande(
                requete.panier() != null ? requete.panier() : Map.of(),
                requete.emailUtilisateur());
        return ResponseEntity.created(URI.create("/api/commandes/" + commande.getId())).body(commande);
    }

    /** GET /api/commandes/{id} — statut et contenu d'une commande. */
    @GetMapping("/{id}")
    public Commande detail(@PathVariable Long id) {
        return commandeService.obtenir(id);
    }

    /** GET /api/commandes — historique (démonstration). */
    @GetMapping
    public List<Commande> lister() {
        return commandeService.lister();
    }

    /** POST /api/commandes/{id}/paiement — paiement simulé (carte 16 chiffres). */
    @PostMapping("/{id}/paiement")
    public Map<String, String> payer(@PathVariable Long id, @RequestBody PaiementRequete requete) {
        Commande commande = commandeService.payer(id, requete.numeroCarte());
        return Map.of("statut", commande.getStatut().name(), "id", String.valueOf(commande.getId()));
    }

    public record CreerCommandeRequete(Map<Long, Integer> panier, String emailUtilisateur) {
    }

    public record PaiementRequete(String numeroCarte) {
        public PaiementRequete {
            if (numeroCarte == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Numéro de carte requis");
            }
        }
    }

    /** Utile à la collection Postman : libellés lisibles des statuts. */
    public enum StatutLibelle {
        COMMANDE_CREEE("COMMANDE CRÉÉE"),
        PAYEE("PAYÉE"),
        ANNULEE("ANNULÉE");

        private final String libelle;

        StatutLibelle(String libelle) {
            this.libelle = libelle;
        }

        public String getLibelle() {
            return libelle;
        }

        public static String libelleDe(StatutCommande statut) {
            return StatutLibelle.valueOf(statut.name()).getLibelle();
        }
    }
}
