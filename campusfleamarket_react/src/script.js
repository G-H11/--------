
    document.getElementById('uploadForm').addEventListener('submit', async (event) => {
        event.preventDefault();
        const fileInput = document.getElementById('fileInput');
        const file = fileInput.files[0];
    
        if (!file) {
            alert('Please select a file.');
            return;
        }
    
        // Create a FormData object and append the file
        const formData = new FormData();
        formData.append('file', file);
    
        // Pinata API credentials (replace with your actual API key and secret)

        const pinataApiKey = '9d7536bd2247a53479a1';
        const pinataSecretApiKey = 'd4cbe7b0dd0895bb47135190fc5938e5b9128ab4cc9c65b1a96e41e5f16a4f94';
    
        try {
            const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
                method: 'POST',
                headers: {
                    'pinata_api_key': pinataApiKey,
                    'pinata_secret_api_key': pinataSecretApiKey
                },
                body: formData
            });
    
            if (!response.ok) {
                throw new Error(`Error: ${response.statusText}`);
            }
    
            const data = await response.json();
            const cid = data.IpfsHash;
    
            // Display the result
            const resultDiv = document.getElementById('result');
            resultDiv.innerHTML = `
                <p>File uploaded successfully!</p>
                <p>CID: ${cid}</p>
                <p><a href="https://gateway.pinata.cloud/ipfs/${cid}" target="_blank">View File</a></p>
                <p><a href="https://gateway.pinata.cloud/ipfs/${cid}" download>Download File</a></p>
            `;
        } catch (error) {
            console.error('Error uploading file:', error);
            alert('Error uploading file. Please try again.');
        }
    });
    