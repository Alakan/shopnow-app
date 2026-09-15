package com.shopnow.model;

/**
 * Statuts possibles d'une commande ShopNow.
 */
public enum StatutCommande {
    /** Commande enregistrée, en attente de paiement. */
    COMMANDE_CREEE,
    /** Paiement (simulé) accepté. */
    PAYEE,
    /** Commande annulée. */
    ANNULEE
}
