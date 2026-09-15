package com.shopnow;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Tests d'intégration de l'API REST (MockMvc + base H2 de démonstration).
 * Vérifie les contrats attendus par la collection Postman du TP.
 */
@SpringBootTest
@AutoConfigureMockMvc
@org.springframework.transaction.annotation.Transactional
class ApiIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void leCatalogueEstDisponible() throws Exception {
        mockMvc.perform(get("/api/produits"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].nom").exists())
                .andExpect(jsonPath("$.length()", org.hamcrest.Matchers.greaterThanOrEqualTo(12)));
    }

    @Test
    void laRechercheFiltreLeCatalogue() throws Exception {
        mockMvc.perform(get("/api/produits").param("q", "casque"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].nom").value(org.hamcrest.Matchers.everyItem(
                        org.hamcrest.Matchers.containsStringIgnoringCase("casque"))));
    }

    @Test
    void laCreationDeProduitRetourne201() throws Exception {
        mockMvc.perform(post("/api/produits")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"nom":"Produit de test","description":"d","categorie":"Test","prix":12.5}"""))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.nom", is("Produit de test")));
    }

    @Test
    void laCreationDeCommandeACreeLeStatutAttendu() throws Exception {
        // Le produit 382 est seedé par data.sql (cf. jeu de données de démonstration).
        mockMvc.perform(post("/api/commandes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"panier":{"382":2},"emailUtilisateur":"alice@example.com"}"""))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.statut", is("COMMANDE_CREEE")))
                .andExpect(jsonPath("$.total").exists())
                .andExpect(jsonPath("$.lignes[0].nomProduit", is("Casque gaming Bluetooth")));
    }

    @Test
    void lePaiementSimulePasseLaCommandeAuStatutPayee() throws Exception {
        String creation = mockMvc.perform(post("/api/commandes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"panier":{"200":1}}"""))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        long id = extractId(creation);

        mockMvc.perform(post("/api/commandes/" + id + "/paiement")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"numeroCarte":"4111111111111111"}"""))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.statut", is("PAYEE")));

        mockMvc.perform(get("/api/commandes/" + id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.statut", is("PAYEE")));
    }

    private long extractId(String json) throws Exception {
        return new com.fasterxml.jackson.databind.ObjectMapper()
                .readTree(json).get("id").asLong();
    }
}
