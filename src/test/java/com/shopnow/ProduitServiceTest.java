package com.shopnow.service;

import com.shopnow.model.Produit;
import com.shopnow.repository.ProduitRepository;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

/**
 * Tests unitaires du service ProduitService.
 */
class ProduitServiceTest {

    private final ProduitRepository produitRepository = mock(ProduitRepository.class);
    private final ProduitService produitService = new ProduitService(produitRepository);

    @Test
    void rechercher_delegueAuRepositoryQuandLeTexteNEstPasVide() {
        when(produitRepository.findByNomContainingIgnoreCaseOrCategorieContainingIgnoreCase(
                "casque", "casque"))
                .thenReturn(List.of(new Produit("Casque gaming", "x", "Audio", BigDecimal.valueOf(89.99))));

        List<Produit> resultats = produitService.rechercher("casque");

        assertThat(resultats).hasSize(1);
        assertThat(resultats.get(0).getNom()).contains("Casque");
    }

    @Test
    void rechercher_sansTexteRetourneToutLeCatalogue() {
        when(produitRepository.findAll()).thenReturn(List.of(
                new Produit("A", "a", "Audio", BigDecimal.ONE),
                new Produit("B", "b", "Mode", BigDecimal.TEN)));

        assertThat(produitService.rechercher("  ")).hasSize(2);
    }

    @Test
    void obtenir_surUnIdInconnu_leve404() {
        when(produitRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> produitService.obtenir(999L))
                .isInstanceOf(RuntimeException.class);
    }
}
