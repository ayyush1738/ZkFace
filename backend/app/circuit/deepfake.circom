pragma circom 2.0.0;

include "node_modules/circomlib/circuits/comparators.circom"; 

template ZKFaceVerifier() {
    // === PRIVATE INPUTS ===
    signal input prediction_score;   // Integer score from model (e.g., 24)
    signal input phash;              // Hex string (e.g., "95cf4aa0441f67f8") converted to decimal

    // === PUBLIC INPUT ===
    signal input cid;                // IPFS CID (you can convert it to Poseidon hash or decimal)

    // === PUBLIC OUTPUT ===
    signal output is_real;           // 1 = real, 0 = fake

    // === CONSTANT THRESHOLD ===
    var threshold = 55;

    // === COMPARATOR ===
    component check = LessThan(8); // 8-bit comparator, sufficient for scores < 256
    check.in[0] <== prediction_score;
    check.in[1] <== threshold;

    is_real <== check.out;
}

component main = ZKFaceVerifier();
