package com.shopnow.model;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Commande ShopNow : lignes de commande (instantané produit) + statut + total.
 */
@Entity
public class Commande {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    private StatutCommande statut;

    private BigDecimal total;

    private String emailUtilisateur;

    private LocalDateTime creeeLe;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    private List<LigneCommande> lignes = new ArrayList<>();

    protected Commande() {
        // requis par JPA
    }

    public Commande(String emailUtilisateur, List<LigneCommande> lignes) {
        this.emailUtilisateur = emailUtilisateur;
        this.lignes = lignes;
        this.statut = StatutCommande.COMMANDE_CREEE;
        this.creeeLe = LocalDateTime.now();
        this.total = lignes.stream()
                .map(LigneCommande::getSousTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public StatutCommande getStatut() { return statut; }
    public void setStatut(StatutCommande statut) { this.statut = statut; }
    public BigDecimal getTotal() { return total; }
    public void setTotal(BigDecimal total) { this.total = total; }
    public String getEmailUtilisateur() { return emailUtilisateur; }
    public LocalDateTime getCreeeLe() { return creeeLe; }
    public List<LigneCommande> getLignes() { return lignes; }
}
