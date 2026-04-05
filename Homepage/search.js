// search.js
// Standalone logic communicating directly with Flask backend running at localhost:5000

// History Injection helper
async function logSearchHistory(productName) {
    const token = localStorage.getItem('shopsmart_token');
    if (!token) return; // Silent return if Guest
    try {
        await fetch('http://127.0.0.1:5000/api/history', {
            method: 'POST',
            headers: { 'Authorization': token, 'Content-Type': 'application/json' },
            body: JSON.stringify({ product_name: productName })
        });
    } catch (e) {
        console.warn('History logging failed', e);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    let currentEngine = 'gemini';
    let lastParsedProduct = null;
    let lastUploadedImage = null;
    
    const loadingOverlay = document.getElementById('loadingOverlay');
    const dealsList = document.getElementById('dealsList');
    let allDealsData = [];
    
    async function fetchDealsOnly(pName, pBrand) {
        loadingOverlay.classList.remove('hidden');
        try {
            // Log this safely out into MySQL!
            logSearchHistory(`${pBrand} ${pName}`);

            const dealsRes = await fetch('http://127.0.0.1:5000/api/deals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    product_name: pName,
                    brand: pBrand || "",
                    type: currentEngine
                })
            });
            const dealsData = await dealsRes.json();
            if(dealsData.error) throw new Error(dealsData.error);
            
            allDealsData = dealsData.deals || [];
            
            const activeFilterObj = document.querySelector('.filter-btn.active');
            const activeFilter = activeFilterObj ? activeFilterObj.dataset.filter : 'all';
            let sortedDeals = [...allDealsData];
            if (activeFilter === 'lowest') {
                sortedDeals = sortedDeals.filter(a => a.price > 0).sort((a,b) => a.price - b.price);
            } else if (activeFilter === 'highest') {
                sortedDeals = sortedDeals.filter(a => a.price > 0).sort((a,b) => b.price - a.price);
            }
            renderDeals(sortedDeals);
        } catch(err) {
            console.error(err);
        } finally {
            loadingOverlay.classList.add('hidden');
        }
    }
    
    const engineBtns = document.querySelectorAll('.engine-btn');
    engineBtns.forEach(btn => {
        btn.addEventListener('click', async () => {
            engineBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentEngine = btn.dataset.engine;
            
            if(lastParsedProduct) {
                await fetchDealsOnly(lastParsedProduct.name, lastParsedProduct.brand);
            }
        });
    });

    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(btn.dataset.tab).classList.add('active');
        });
    });

    const fileInput = document.getElementById('imageUploadInput');
    const imagePreview = document.getElementById('imagePreview');
    let uploadedBase64 = null;

    fileInput.addEventListener('change', (e) => {
        if(e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (e) => {
                imagePreview.src = e.target.result;
                imagePreview.classList.remove('hidden');
                uploadedBase64 = e.target.result;
            }
            reader.readAsDataURL(e.target.files[0]);
        }
    });

    const video = document.getElementById('cameraStream');
    const canvas = document.getElementById('cameraCanvas');
    const cameraPreview = document.getElementById('cameraPreview');
    const captureBtn = document.getElementById('captureBtn');
    const retakeBtn = document.getElementById('retakeBtn');
    let cameraStream = null;
    let cameraBase64 = null;

    document.querySelector('[data-tab="camera-tab"]').addEventListener('click', async () => {
        if(!cameraStream) {
            try {
                cameraStream = await navigator.mediaDevices.getUserMedia({ video: true });
                video.srcObject = cameraStream;
            } catch (err) {
                console.error("Camera error:", err);
            }
        }
    });

    captureBtn.addEventListener('click', () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0);
        cameraBase64 = canvas.toDataURL('image/jpeg');
        cameraPreview.src = cameraBase64;
        cameraPreview.classList.remove('hidden');
        video.classList.add('hidden');
        captureBtn.classList.add('hidden');
        retakeBtn.classList.remove('hidden');
    });

    retakeBtn.addEventListener('click', () => {
        cameraBase64 = null;
        cameraPreview.classList.add('hidden');
        video.classList.remove('hidden');
        captureBtn.classList.remove('hidden');
        retakeBtn.classList.add('hidden');
    });

    const submitBtn = document.getElementById('submitShopSmartBtn');
    const uploadSection = document.getElementById('uploadSection');
    const resultsSection = document.getElementById('resultsSection');
    
    submitBtn.addEventListener('click', async () => {
        const activeTab = document.querySelector('.tab-btn.active').dataset.tab;
        let payload = {};

        if (activeTab === 'text-tab') {
            const textValue = document.getElementById('productTextInput').value.trim();
            if(!textValue) return alert("Please type a product name.");
            payload = { text: textValue };
            lastUploadedImage = null;
        } else if (activeTab === 'upload-tab') {
            if(!uploadedBase64) return alert("Please select an image.");
            payload = { image: uploadedBase64 };
            lastUploadedImage = uploadedBase64;
        } else if (activeTab === 'camera-tab') {
            if(!cameraBase64) return alert("Please capture an image using the button.");
            payload = { image: cameraBase64 };
            lastUploadedImage = cameraBase64;
        }

        loadingOverlay.classList.remove('hidden');

        try {
            // STEP 1: Query local proxy for Gemini Identification
            const idRes = await fetch('http://127.0.0.1:5000/api/identify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const productData = await idRes.json();
            if(productData.error) throw new Error(productData.error);
            
            const pName = productData.product_name;
            lastParsedProduct = { name: pName, brand: productData.brand || "" };

            document.getElementById('identifiedProductName').textContent = pName || "Unknown Product";
            document.getElementById('infoBrand').textContent = productData.brand || "Unknown";
            document.getElementById('infoModel').textContent = productData.model_number || "Unknown";
            document.getElementById('infoCategory').textContent = productData.category || "Unknown";
            
            const featuresList = document.getElementById('infoFeatures');
            featuresList.innerHTML = '';
            (productData.key_features || []).forEach(f => {
                let li = document.createElement('li');
                li.textContent = f;
                featuresList.appendChild(li);
            });
            
            const productSideImg = document.getElementById('productSideImg');
            if(lastUploadedImage) {
                productSideImg.src = lastUploadedImage;
                productSideImg.style.display = 'block';
            } else {
                productSideImg.style.display = 'none';
            }

            uploadSection.classList.add('hidden');
            resultsSection.classList.remove('hidden');

            await fetchDealsOnly(lastParsedProduct.name, lastParsedProduct.brand);
            
        } catch (err) {
            console.error(err);
            alert("Identification request failed. Please check your network connection and configuration keys.");
            loadingOverlay.classList.add('hidden');
        } finally {
            if(cameraStream) {
                cameraStream.getTracks().forEach(track => track.stop());
                cameraStream = null;
            }
        }
    });

    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const filterType = btn.dataset.filter;
            let sortedDeals = [...allDealsData];
            
            if (filterType === 'lowest') {
                sortedDeals = sortedDeals.filter(a => a.price > 0).sort((a,b) => a.price - b.price);
            } else if (filterType === 'highest') {
                sortedDeals = sortedDeals.filter(a => a.price > 0).sort((a,b) => b.price - a.price);
            }
            renderDeals(sortedDeals);
        });
    });

    function renderDeals(deals) {
        dealsList.innerHTML = '';
        if (deals.length === 0) {
            dealsList.innerHTML = '<p>No deals found.</p>';
            return;
        }

        deals.forEach(deal => {
            const card = document.createElement('div');
            card.className = 'deal-card';
            let imgHtml = deal.image ? `<img src="${deal.image}" alt="Product" class="deal-img">` : `<div class="deal-img" style="display:flex;align-items:center;justify-content:center;">No Image</div>`;
            card.innerHTML = `
                ${imgHtml}
                <div class="deal-details">
                    <h3>${deal.title}</h3>
                    <div class="deal-meta">
                        <span class="store-badge">${deal.store}</span>
                        ${deal.rating ? `<span>⭐ ${deal.rating} (${deal.reviews} reviews)</span>` : ''}
                    </div>
                    <div class="deal-price">${deal.price_str}</div>
                </div>
                <a href="${deal.link}" target="_blank" class="checkout-btn">Proceed to Checkout</a>
            `;
            dealsList.appendChild(card);
        });
    }
});
