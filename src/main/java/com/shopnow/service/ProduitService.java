package com.shopnow.service;

import com.shopnow.model.Produit;
import com.shopnow.repository.ProduitRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.util.List;

/**
 * Services métier du catalogue.
 */
@Service
@Transactional
public class ProduitService {

    private final ProduitRepository produitRepository;

    public ProduitService(ProduitRepository produitRepository) {
        this.produitRepository = produitRepository;
    }

    public List<Produit> lister() {
        return produitRepository.findAll();
    }

    public List<Produit> rechercher(String texte) {
        if (texte == null || texte.isBlank()) {
            return produitRepository.findAll();
        }
        return produitRepository.findByNomContainingIgnoreCaseOrCategorieContainingIgnoreCase(
                texte.trim(), texte.trim());
    }

    public Produit obtenir(Long id) {
        return produitRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Produit introuvable : " + id));
    }

    public Produit creer(Produit produit) {
        return produitRepository.save(produit);
    }
}
