package com.shopnow.service;

import com.shopnow.model.Commande;
import com.shopnow.model.LigneCommande;
import com.shopnow.model.Produit;
import com.shopnow.model.StatutCommande;
import com.shopnow.repository.CommandeRepository;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

/**
 * Tests unitaires du service CommandeService (sans base de données).
 */
class CommandeServiceTest {

    private final CommandeRepository commandeRepository = mock(CommandeRepository.class);
    private final ProduitService produitService = mock(ProduitService.class);
    private final CommandeService commandeService =
            new CommandeService(commandeRepository, produitService);

    private Produit produit(long id, String nom, double prix) {
        Produit p = new Produit(nom, "Description " + nom, "Test", BigDecimal.valueOf(prix));
        p.setId(id);
        return p;
    }

    @Test
    void creerCommande_calculeLeTotalEtLeStatutInitial() {
        when(produitService.obtenir(382L)).thenReturn(produit(382L, "Casque gaming", 89.99));
        when(produitService.obtenir(101L)).thenReturn(produit(101L, "Clavier mécanique", 79.90));
        when(commandeRepository.save(any(Commande.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        Commande commande = commandeService.creerCommande(
                Map.of(382L, 2, 101L, 1), "alice@example.com");

        assertThat(commande.getStatut()).isEqualTo(StatutCommande.COMMANDE_CREEE);
        assertThat(commande.getTotal()).isEqualByComparingTo("259.88"); // 2×89.99 + 79.90
        assertThat(commande.getLignes()).hasSize(2);
        assertThat(commande.getEmailUtilisateur()).isEqualTo("alice@example.com");
        LigneCommande ligne = commande.getLignes().stream()
                .filter(l -> l.getProduitId().equals(382L)).findFirst().orElseThrow();
        assertThat(ligne.getSousTotal()).isEqualByComparingTo("179.98");
    }

    @Test
    void creerCommande_avecPanierVide_leveUneException() {
        assertThatThrownBy(() -> commandeService.creerCommande(Map.of(), null))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Panier vide");
    }

    @Test
    void payer_refuseUneCarteInvalide() {
        assertThatThrownBy(() -> commandeService.payer(1L, "123"))
                .isInstanceOf(RuntimeException.class);
    }

    @Test
    void payer_valideUneCarteA16Chiffres() {
        Commande commande = new Commande("bob@example.com",
                List.of(new LigneCommande(382L, "Casque", BigDecimal.TEN, 1)));
        when(commandeRepository.findById(42L)).thenReturn(java.util.Optional.of(commande));
        when(commandeRepository.save(any(Commande.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        Commande payee = commandeService.payer(42L, "4111 1111 1111 1111");

        assertThat(payee.getStatut()).isEqualTo(StatutCommande.PAYEE);
    }
}
