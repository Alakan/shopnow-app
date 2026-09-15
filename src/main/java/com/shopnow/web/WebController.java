package com.shopnow.web;

import com.shopnow.model.Produit;
import com.shopnow.service.ProduitService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

/**
 * Pages du site ShopNow (catalogue + recherche + historique).
 */
@Controller
public class WebController {

    private final ProduitService produitService;

    public WebController(ProduitService produitService) {
        this.produitService = produitService;
    }

    /** Accueil : catalogue, avec recherche par nom/catégorie (?q=). */
    @GetMapping("/")
    public String accueil(@RequestParam(required = false) String q, Model model) {
        model.addAttribute("produits", produitService.rechercher(q));
        model.addAttribute("q", q);
        return "index";
    }

    /** Fiche produit. */
    @GetMapping("/produit/{id}")
    public String fiche(@PathVariable Long id, Model model) {
        model.addAttribute("produit", produitService.obtenir(id));
        return "produit";
    }

}
