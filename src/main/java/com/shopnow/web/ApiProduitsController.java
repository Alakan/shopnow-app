package com.shopnow.web;

import com.shopnow.model.Produit;
import com.shopnow.service.ProduitService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.net.URI;
import java.util.List;

/**
 * API REST du catalogue — endpoint testé par la collection Postman/Newman du TP.
 */
@RestController
@RequestMapping("/api/produits")
public class ApiProduitsController {

    private final ProduitService produitService;

    public ApiProduitsController(ProduitService produitService) {
        this.produitService = produitService;
    }

    /** GET /api/produits?q=casque — liste (ou recherche) des produits. */
    @GetMapping
    public List<Produit> lister(@RequestParam(required = false) String q) {
        return produitService.rechercher(q);
    }

    /** GET /api/produits/{id} — détail d'un produit. */
    @GetMapping("/{id}")
    public Produit detail(@PathVariable Long id) {
        return produitService.obtenir(id);
    }

    /** POST /api/produits — création d'un produit (201 + Location). */
    @PostMapping
    public ResponseEntity<Produit> creer(@RequestBody CreerProduitRequete requete) {
        Produit produit = produitService.creer(new Produit(
                requete.nom(), requete.description(), requete.categorie(), requete.prix()));
        return ResponseEntity.created(URI.create("/api/produits/" + produit.getId())).body(produit);
    }

    public record CreerProduitRequete(String nom, String description, String categorie, BigDecimal prix) {
        public CreerProduitRequete {
            if (nom == null || nom.isBlank() || prix == null) {
                throw new IllegalArgumentException("Nom et prix obligatoires");
            }
        }
    }
}
