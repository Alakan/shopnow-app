package com.shopnow;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * ShopNow — application de démonstration pour le module « Stratégie de tests » (CESI).
 * Mini e-commerce : catalogue, panier, commande, paiement simulé, comptes utilisateurs.
 */
@SpringBootApplication
public class ShopNowApplication {

    public static void main(String[] args) {
        SpringApplication.run(ShopNowApplication.class, args);
    }
}
