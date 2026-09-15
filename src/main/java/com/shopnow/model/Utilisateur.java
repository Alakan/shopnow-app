package com.shopnow.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

/**
 * Compte utilisateur ShopNow (démonstration : hachage simple, à remplacer par
 * un mécanisme robuste dans une application réelle — jamais de mot de passe en clair).
 */
@Entity
public class Utilisateur {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nom;
    private String email;
    private String hashMotDePasse;
    private String sel;

    protected Utilisateur() {
        // requis par JPA
    }

    public Utilisateur(String nom, String email, String hashMotDePasse, String sel) {
        this.nom = nom;
        this.email = email;
        this.hashMotDePasse = hashMotDePasse;
        this.sel = sel;
    }

    public Long getId() { return id; }
    public String getNom() { return nom; }
    public String getEmail() { return email; }
    public String getHashMotDePasse() { return hashMotDePasse; }
    public String getSel() { return sel; }
}
