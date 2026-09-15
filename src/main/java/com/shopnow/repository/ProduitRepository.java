package com.shopnow.repository;

import com.shopnow.model.Produit;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProduitRepository extends JpaRepository<Produit, Long> {

    /** Recherche insensible à la casse sur le nom (et le libellé de catégorie). */
    List<Produit> findByNomContainingIgnoreCaseOrCategorieContainingIgnoreCase(String nom, String categorie);
}
