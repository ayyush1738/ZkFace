pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/comparators.circom";

template DeepfakeDetection(n) {
    signal input pHash;          
    signal input cid;           
    signal input ai_prediction;  
    signal input threshold;    
    signal output isTrue;       

    component compare = LessThan(n);

    compare.in[0] <== ai_prediction;
    compare.in[1] <== threshold;

    // Determine if the AI prediction indicates real (isTrue = 1 if ai_prediction >= threshold)
    isTrue <== 1 - compare.out;  // Outputs 1 if ai_prediction >= threshold (isTrue for real)
}

component main {public [pHash, cid, ai_prediction, threshold]} = DeepfakeDetection(16);
