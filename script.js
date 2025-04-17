document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const inputTextRadio = document.getElementById('input-text');
    const inputBinaryRadio = document.getElementById('input-binary');
    const textInputContainer = document.getElementById('text-input-container');
    const binaryInputContainer = document.getElementById('binary-input-container');
    const processBtn = document.getElementById('process-btn');
    const resetBtn = document.getElementById('reset-btn');
    const roundsContainer = document.getElementById('rounds-container');
    const errorElement = document.getElementById('error-message');
    
    // Initialize
    initEventListeners();
    initInputEnhancements();
    
    function initEventListeners() {
        // Input type toggle
        inputTextRadio.addEventListener('change', toggleInputType);
        inputBinaryRadio.addEventListener('change', toggleInputType);
        
        // Button events
        processBtn.addEventListener('click', processFeistel);
        resetBtn.addEventListener('click', resetForm);
        
        // Toggle round content visibility
        document.addEventListener('click', function(e) {
            if (e.target.classList.contains('round-header') || 
                e.target.closest('.round-header')) {
                const header = e.target.classList.contains('round-header') ? 
                    e.target : e.target.closest('.round-header');
                const content = header.nextElementSibling;
                content.classList.toggle('show');
                const icon = header.querySelector('i');
                if (icon) {
                    icon.classList.toggle('fa-chevron-down');
                    icon.classList.toggle('fa-chevron-up');
                }
            }
        });
    }
    
    function initInputEnhancements() {
        // Input character counting
        document.getElementById('plaintext').addEventListener('input', function() {
            document.querySelector('#text-input-container .char-count').textContent = 
                `${this.value.length} characters`;
        });
        
        document.getElementById('binary-input').addEventListener('input', function() {
            const count = this.value.length;
            const isValid = /^[01]*$/.test(this.value);
            
            document.querySelector('#binary-input-container .char-count').textContent = 
                `${count} bits`;
                
            const validEl = document.querySelector('#binary-input-container .validation-status.valid');
            const invalidEl = document.querySelector('#binary-input-container .validation-status.invalid');
            
            if (isValid) {
                validEl.style.display = 'flex';
                invalidEl.style.display = 'none';
            } else {
                validEl.style.display = 'none';
                invalidEl.style.display = 'flex';
            }
        });
        
        // Sync range and number inputs for rounds
        const roundsRange = document.getElementById('rounds-range');
        const roundsNumber = document.getElementById('rounds');
        
        roundsRange.addEventListener('input', function() {
            roundsNumber.value = this.value;
        });
        
        roundsNumber.addEventListener('input', function() {
            if (this.value > 16) this.value = 16;
            if (this.value < 1) this.value = 1;
            roundsRange.value = this.value;
        });
        
        // Sample input buttons
        document.querySelectorAll('.sample-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const container = this.closest('.input-group');
                const type = this.getAttribute('data-type');
                
                // Create or toggle popup
                let popup = container.querySelector('.sample-popup');
                if (!popup) {
                    popup = document.createElement('div');
                    popup.className = 'sample-popup';
                    
                    // Add sample options
                    const samples = type === 'text' ? [
                        {text: 'Hello World', label: 'Simple text'},
                        {text: 'The quick brown fox jumps over the lazy dog', label: 'Pangram'},
                        {text: 'Feistel Cipher Demonstration', label: 'Technical'}
                    ] : [
                        {text: '0101010101010101', label: '8-bit pattern'},
                        {text: '1100110000110011', label: '16-bit sample'},
                        {text: '10101010101010101010101010101010', label: '32-bit sample'}
                    ];
                    
                    samples.forEach(sample => {
                        const option = document.createElement('div');
                        option.className = 'sample-option';
                        option.textContent = sample.label;
                        option.addEventListener('click', () => {
                            const input = container.querySelector('textarea, input');
                            input.value = sample.text;
                            input.dispatchEvent(new Event('input'));
                            popup.classList.remove('show');
                        });
                        popup.appendChild(option);
                    });
                    
                    container.appendChild(popup);
                }
                
                // Toggle popup
                popup.classList.toggle('show');
            });
        });
        
        // Close sample popups when clicking elsewhere
        document.addEventListener('click', function() {
            document.querySelectorAll('.sample-popup').forEach(popup => {
                popup.classList.remove('show');
            });
        });
    }
    
    function toggleInputType() {
        if (inputTextRadio.checked) {
            textInputContainer.style.display = 'block';
            binaryInputContainer.style.display = 'none';
        } else {
            textInputContainer.style.display = 'none';
            binaryInputContainer.style.display = 'block';
        }
    }
    
    function resetForm() {
        // Reset input fields
        document.getElementById('plaintext').value = '';
        document.getElementById('binary-input').value = '';
        document.getElementById('key').value = '';
        document.getElementById('rounds').value = '4';
        document.getElementById('rounds-range').value = '4';
        document.getElementById('result').value = '';
        document.getElementById('binary-result').value = '';
        document.getElementById('input-text').checked = true;
        textInputContainer.style.display = 'block';
        binaryInputContainer.style.display = 'none';
        
        // Reset character counts
        document.querySelector('#text-input-container .char-count').textContent = '0 characters';
        document.querySelector('#binary-input-container .char-count').textContent = '0 bits';
        
        // Reset validation status
        document.querySelector('#binary-input-container .validation-status.valid').style.display = 'none';
        document.querySelector('#binary-input-container .validation-status.invalid').style.display = 'none';
        
        // Reset visualization
        roundsContainer.innerHTML = '';
        
        // Reset error message
        errorElement.textContent = '';
    }
    
    function processFeistel() {
        errorElement.textContent = '';
        roundsContainer.innerHTML = '';
        
        try {
            // Get input parameters
            const isTextInput = inputTextRadio.checked;
            const input = isTextInput ? 
                document.getElementById('plaintext').value : 
                document.getElementById('binary-input').value;
            const key = document.getElementById('key').value;
            const rounds = parseInt(document.getElementById('rounds').value);
            const logicGate = document.getElementById('logic-gate').value;
            const isEncrypt = document.getElementById('operation-encrypt').checked;
            
            // Validate input
            if (!input) throw new Error('Please enter input data');
            if (!key) throw new Error('Please enter a key');
            if (isNaN(rounds) || rounds < 1 || rounds > 16) {
                throw new Error('Number of rounds must be between 1 and 16');
            }
            
            let binaryInput;
            if (isTextInput) {
                binaryInput = textToBinary(input);
            } else {
                if (!/^[01]+$/.test(input)) {
                    throw new Error('Binary input must contain only 0s and 1s');
                }
                if (input.length % 2 !== 0) {
                    throw new Error('Binary input must have even length');
                }
                binaryInput = input;
            }
            
            // Process key (convert to binary if needed)
            let binaryKey;
            if (/^[01]+$/.test(key)) {
                binaryKey = key;
            } else {
                binaryKey = textToBinary(key);
            }
            
            // Pad binary input if needed (must be even length)
            if (binaryInput.length % 2 !== 0) {
                binaryInput += '0';
            }
            
            // Pad binary key to match half the input length
            const halfLength = binaryInput.length / 2;
            if (binaryKey.length < halfLength) {
                binaryKey = binaryKey.padEnd(halfLength, '0');
            } else if (binaryKey.length > halfLength) {
                binaryKey = binaryKey.substring(0, halfLength);
            }
            
            // Perform Feistel encryption/decryption
            const result = isEncrypt ? 
                feistelEncrypt(binaryInput, binaryKey, rounds, logicGate) :
                feistelDecrypt(binaryInput, binaryKey, rounds, logicGate);
            
            // Display results
            document.getElementById('binary-result').value = result;
            document.getElementById('result').value = isTextInput ? 
                (tryBinaryToText(result) || 'Binary cannot be converted to text') : 
                'Binary output';
            
        } catch (error) {
            errorElement.textContent = error.message;
        }
    }
    
    // Helper functions
    function textToBinary(text) {
        return text.split('').map(char => 
            char.charCodeAt(0).toString(2).padStart(8, '0')
        ).join('');
    }
    
    function tryBinaryToText(binary) {
        try {
            return binaryToText(binary);
        } catch {
            return null;
        }
    }
    
    function binaryToText(binary) {
        if (binary.length % 8 !== 0) throw new Error('Binary length must be multiple of 8');
        let text = '';
        for (let i = 0; i < binary.length; i += 8) {
            text += String.fromCharCode(parseInt(binary.substr(i, 8), 2));
        }
        return text;
    }
    
    function applyLogicGate(a, b, gate) {
        let result = '';
        const len = Math.min(a.length, b.length);
        for (let i = 0; i < len; i++) {
            const bitA = parseInt(a[i]);
            const bitB = parseInt(b[i]);
            let res;
            switch (gate) {
                case 'XOR': res = bitA ^ bitB; break;
                case 'AND': res = bitA & bitB; break;
                case 'OR': res = bitA | bitB; break;
                case 'NAND': res = 1 - (bitA & bitB); break;
                case 'NOR': res = 1 - (bitA | bitB); break;
                default: res = bitA ^ bitB;
            }
            result += res.toString();
        }
        return result;
    }
    
    function xor(a, b) {
        let result = '';
        const len = Math.min(a.length, b.length);
        for (let i = 0; i < len; i++) {
            result += (parseInt(a[i]) ^ parseInt(b[i])).toString();
        }
        return result;
    }
    
    function feistelEncrypt(input, key, rounds, logicGate) {
        const half = input.length / 2;
        let left = input.substring(0, half);
        let right = input.substring(half);
        
        // Add initial state to visualization
        addRoundToVisualization(0, 'Initial State', `
            <div class="step">
                <p>Input: <span class="highlight">${input}</span></p>
                <p>Split into:</p>
                <p>Left (L<sub>0</sub>): <span class="highlight">${left}</span></p>
                <p>Right (R<sub>0</sub>): <span class="highlight">${right}</span></p>
            </div>
        `);
        
        for (let i = 0; i < rounds; i++) {
            const roundContent = [];
            
            // Round function
            const fResult = applyLogicGate(right, key, logicGate);
            roundContent.push(`
                <div class="step">
                    <p><strong>F Function (${logicGate}):</strong></p>
                    <p>F(R<sub>${i}</sub>, K) = ${logicGate}(<span class="highlight">${right}</span>, <span class="highlight">${key}</span>)</p>
                    <p>Result: <span class="highlight">${fResult}</span></p>
                </div>
            `);
            
            // XOR with left
            const newRight = xor(left, fResult);
            roundContent.push(`
                <div class="step">
                    <p><strong>XOR Operation:</strong></p>
                    <p>L<sub>${i}</sub> ⊕ F(R<sub>${i}</sub>, K) = <span class="highlight">${left}</span> ⊕ <span class="highlight">${fResult}</span></p>
                    <p>Result: <span class="highlight">${newRight}</span></p>
                </div>
            `);
            
            // Swap (except last round)
            if (i < rounds - 1) {
                const oldLeft = left;
                left = right;
                right = newRight;
                roundContent.push(`
                    <div class="step">
                        <p><strong>Swap Halves:</strong></p>
                        <p>New L<sub>${i+1}</sub> = R<sub>${i}</sub> = <span class="highlight">${left}</span></p>
                        <p>New R<sub>${i+1}</sub> = XOR result = <span class="highlight">${right}</span></p>
                    </div>
                `);
            } else {
                left = newRight;
                roundContent.push(`
                    <div class="step">
                        <p><strong>Final Round (no swap):</strong></p>
                        <p>L<sub>${i+1}</sub> = XOR result = <span class="highlight">${left}</span></p>
                        <p>R<sub>${i+1}</sub> = R<sub>${i}</sub> = <span class="highlight">${right}</span></p>
                    </div>
                `);
            }
            
            // Add round to visualization
            addRoundToVisualization(i+1, `Round ${i+1}`, roundContent.join(''));
        }
        
        // Final combination
        const ciphertext = left + right;
        addRoundToVisualization(rounds+1, 'Final Ciphertext', `
            <div class="step">
                <p>Combined L<sub>${rounds}</sub> + R<sub>${rounds}</sub>:</p>
                <p><span class="highlight">${left}</span> + <span class="highlight">${right}</span></p>
                <p>Final Ciphertext: <span class="highlight binary">${ciphertext}</span></p>
            </div>
        `);
        
        return ciphertext;
    }
    
    function feistelDecrypt(input, key, rounds, logicGate) {
        const half = input.length / 2;
        let left = input.substring(0, half);
        let right = input.substring(half);
        
        // Add initial state to visualization
        addRoundToVisualization(0, 'Initial Ciphertext', `
            <div class="step">
                <p>Ciphertext: <span class="highlight">${input}</span></p>
                <p>Split into:</p>
                <p>Left (L<sub>0</sub>): <span class="highlight">${left}</span></p>
                <p>Right (R<sub>0</sub>): <span class="highlight">${right}</span></p>
            </div>
        `);
        
        for (let i = rounds - 1; i >= 0; i--) {
            const roundNum = rounds - i;
            const roundContent = [];
            
            // Round function
            const fResult = applyLogicGate(left, key, logicGate);
            roundContent.push(`
                <div class="step">
                    <p><strong>F Function (${logicGate}):</strong></p>
                    <p>F(L<sub>${roundNum-1}</sub>, K) = ${logicGate}(<span class="highlight">${left}</span>, <span class="highlight">${key}</span>)</p>
                    <p>Result: <span class="highlight">${fResult}</span></p>
                </div>
            `);
            
            // XOR with right
            const newLeft = xor(right, fResult);
            roundContent.push(`
                <div class="step">
                    <p><strong>XOR Operation:</strong></p>
                    <p>R<sub>${roundNum-1}</sub> ⊕ F(L<sub>${roundNum-1}</sub>, K) = <span class="highlight">${right}</span> ⊕ <span class="highlight">${fResult}</span></p>
                    <p>Result: <span class="highlight">${newLeft}</span></p>
                </div>
            `);
            
            // Swap (except last round)
            if (i > 0) {
                const oldRight = right;
                right = left;
                left = newLeft;
                roundContent.push(`
                    <div class="step">
                        <p><strong>Swap Halves:</strong></p>
                        <p>New R<sub>${roundNum}</sub> = L<sub>${roundNum-1}</sub> = <span class="highlight">${right}</span></p>
                        <p>New L<sub>${roundNum}</sub> = XOR result = <span class="highlight">${left}</span></p>
                    </div>
                `);
            } else {
                right = newLeft;
                roundContent.push(`
                    <div class="step">
                        <p><strong>Final Round (no swap):</strong></p>
                        <p>R<sub>${roundNum}</sub> = XOR result = <span class="highlight">${right}</span></p>
                        <p>L<sub>${roundNum}</sub> = L<sub>${roundNum-1}</sub> = <span class="highlight">${left}</span></p>
                    </div>
                `);
            }
            
            // Add round to visualization
            addRoundToVisualization(roundNum, `Decryption Round ${roundNum}`, roundContent.join(''));
        }
        
        // Final combination
        const plaintext = left + right;
        addRoundToVisualization(rounds+1, 'Final Plaintext', `
            <div class="step">
                <p>Combined L<sub>${rounds}</sub> + R<sub>${rounds}</sub>:</p>
                <p><span class="highlight">${left}</span> + <span class="highlight">${right}</span></p>
                <p>Final Plaintext: <span class="highlight binary">${plaintext}</span></p>
            </div>
        `);
        
        return plaintext;
    }
    
    function addRoundToVisualization(roundNumber, title, content) {
        const roundDiv = document.createElement('div');
        roundDiv.className = 'round';
        roundDiv.innerHTML = `
            <div class="round-header">
                <h3>${title}</h3>
                <i class="fas fa-chevron-down"></i>
            </div>
            <div class="round-content">
                ${content}
            </div>
        `;
        roundsContainer.appendChild(roundDiv);
    }
});