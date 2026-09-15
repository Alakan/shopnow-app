package com.shopnow.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * Ligne d'une commande : instantané du produit au moment de la commande
 * (libellé et prix copiés — la ligne survit à la modification du catalogue).
 */
@Entity
public class LigneCommande {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long produitId;
    private String nomProduit;
    private BigDecimal prixUnitaire;
    private int quantite;

    protected LigneCommande() {
        // requis par JPA
    }

    public LigneCommande(Long produitId, String nomProduit, BigDecimal prixUnitaire, int quantite) {
        this.produitId = produitId;
        this.nomProduit = nomProduit;
        this.prixUnitaire = prixUnitaire;
        this.quantite = quantite;
    }

    public BigDecimal getSousTotal() {
        return prixUnitaire.multiply(BigDecimal.valueOf(quantite)).setScale(2, RoundingMode.HALF_UP);
    }

    public Long getId() { return id; }
    public Long getProduitId() { return produitId; }
    public String getNomProduit() { return nomProduit; }
    public BigDecimal getPrixUnitaire() { return prixUnitaire; }
    public int getQuantite() { return quantite; }
}
