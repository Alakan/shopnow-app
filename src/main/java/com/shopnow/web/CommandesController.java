package com.shopnow.web;

import com.shopnow.model.Commande;
import com.shopnow.model.Utilisateur;
import com.shopnow.service.CommandeService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * Historique des commandes (démonstration : toutes les commandes enregistrées,
 * affichées avec leur libellé de statut lisible).
 */
@Controller
public class CommandesController {

    private final CommandeService commandeService;

    public CommandesController(CommandeService commandeService) {
        this.commandeService = commandeService;
    }

    @GetMapping("/commandes")
    public String commandes(Model model) {
        model.addAttribute("commandes", commandeService.lister());
        return "commandes";
    }

    /** Variante du libellé pour les templates. */
    public static String libelle(Commande commande) {
        return ApiCommandesController.StatutLibelle.libelleDe(commande.getStatut());
    }
}
