# ZK-SNARK Proof Generation with Circom and SnarkJS

This project demonstrates how to create Zero-Knowledge Proofs using Circom circuits and SnarkJS. It includes a complete workflow from circuit compilation to proof generation and verification.

## 📁 Project Structure

```
verifier_proof/
├── package.json              # Node.js dependencies
├── readme.md                 # This file
├── circuits/
│   └── aiCircuit.circom      # Main Circom circuit
├── inputs/
│   └── input.json            # Circuit input parameters
├── outputs/                  # Generated files
│   ├── aiCircuit.r1cs        # Rank-1 Constraint System
│   ├── aiCircuit.sym         # Symbol file
│   ├── aiproof_key.zkey      # Initial proving key
│   ├── aiproof_final_key.zkey # Final proving key (after contribution)
│   ├── proof.json            # Generated proof
│   ├── public.json           # Public signals
│   ├── verification_key.json # Verification key
│   ├── witness.wtns          # Witness file
│   └── aiCircuit_js/         # JavaScript files for witness generation
│       ├── aiCircuit.wasm
│       ├── generate_witness.js
│       └── witness_calculator.js
└── zkproof/                  # Powers of Tau ceremony files
    ├── pot12_0000.ptau
    ├── pot12_0001.ptau
    └── pot12_final.ptau
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- Circom compiler
- SnarkJS library

### Installation

```bash
npm install
```

## 📋 Step-by-Step Guide

### 1. Compile the Circuit

Compile the Circom circuit to generate R1CS, WASM, and symbol files:

```bash
circom circuits\aiCircuit.circom --r1cs --wasm --sym -o outputs
```

**Output files:**
- `outputs/aiCircuit.r1cs` - Constraint system
- `outputs/aiCircuit_js/aiCircuit.wasm` - WebAssembly for witness generation
- `outputs/aiCircuit.sym` - Symbol mapping

### 2. Powers of Tau Ceremony

Create the trusted setup for the proof system:

```bash
mkdir zkproof
cd zkproof

# Start new ceremony
snarkjs powersoftau new bn128 12 pot12_0000.ptau -v

# Contribute randomness
snarkjs powersoftau contribute pot12_0000.ptau pot12_0001.ptau --name="First contribution" -v

# Verify the contribution
snarkjs powersoftau verify pot12_0001.ptau

# Prepare for circuit-specific setup
snarkjs powersoftau prepare phase2 pot12_0001.ptau pot12_final.ptau -v
```

### 3. Circuit-Specific Setup

Generate proving and verification keys:

```bash
# Generate initial proving key
snarkjs groth16 setup outputs\aiCircuit.r1cs zkproof\pot12_final.ptau outputs\aiproof_key.zkey

# Contribute to the proving key
snarkjs zkey contribute outputs\aiproof_key.zkey outputs\aiproof_final_key.zkey --name="First contribution" -v

# Export verification key
snarkjs zkey export verificationkey outputs\aiproof_final_key.zkey outputs\verification_key.json
```

### 4. Generate Proof

Create a proof for your specific inputs:

```bash
# Generate witness from inputs
node outputs\aiCircuit_js\generate_witness.js outputs\aiCircuit_js\aiCircuit.wasm inputs\input.json outputs\witness.wtns

# Generate the proof
snarkjs groth16 prove outputs\aiproof_final_key.zkey outputs\witness.wtns outputs\proof.json outputs\public.json
```

### 5. Verify Proof

Verify that the proof is valid:

```bash
snarkjs groth16 verify outputs\verification_key.json outputs\public.json outputs\proof.json
```

If successful, you should see: `[INFO] snarkJS: OK!`

## 🔧 Usage

1. **Modify Circuit**: Edit `circuits/aiCircuit.circom` to define your constraints
2. **Update Inputs**: Modify `inputs/input.json` with your specific input values
3. **Run Setup**: Follow steps 1-3 (only needed once per circuit)
4. **Generate Proofs**: Run steps 4-5 for each proof generation

## 📝 Important Notes

- The Powers of Tau ceremony (step 2) creates a universal trusted setup
- The circuit-specific setup (step 3) is required for each unique circuit
- Keep your `.zkey` files secure as they contain the proving keys
- The verification key can be shared publicly for proof verification

## 🛠️ Troubleshooting

- Ensure all file paths use the correct directory separators for your OS
- Verify that all prerequisite tools are properly installed
- Check that input.json matches your circuit's expected inputs

## 📚 Additional Resources

- [Circom Documentation](https://docs.circom.io/)
- [SnarkJS Documentation](https://github.com/iden3/snarkjs)
- [ZK-SNARKs Explained](https://blog.ethereum.org/2016/12/05/zksnarks-in-a-nutshell/)