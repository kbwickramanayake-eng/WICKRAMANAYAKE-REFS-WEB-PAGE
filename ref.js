document.addEventListener('DOMContentLoaded', () => {
    if (!appState.data.currentUser || appState.data.currentUser.type !== 'rep') {
        window.location.href = 'index.html';
        return;
    }

    document.getElementById('rep-welcome-name').textContent = `Hello, ${appState.data.currentUser.name}`;

    function renderRepShops(filter = '') {
        const list = document.getElementById('rep-shops-list');
        list.innerHTML = '';
        
        const myShops = appState.data.shops.filter(s => s.assignedRefId === appState.data.currentUser.id);
        
        const filteredShops = myShops.filter(s => 
            s.name.toLowerCase().includes(filter.toLowerCase()) || 
            s.address.toLowerCase().includes(filter.toLowerCase())
        );

        if(filteredShops.length === 0) {
            list.innerHTML = `<div class="col-span-full py-12 text-center text-gray-400">No assigned shops found.</div>`;
            return;
        }

        filteredShops.forEach(shop => {
            const outstanding = shop.outstanding || 0;
            const card = document.createElement('div');
            card.className = `rounded-2xl border transition-all bg-white hover:border-green-300 cursor-pointer shadow-sm overflow-hidden flex flex-col group`;
            card.onclick = () => openVisitModal(shop);
            
            card.innerHTML = `
                <div class="relative w-full h-32 bg-gray-100 overflow-hidden">
                    <img src="default_shop.png" alt="Shop exterior" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onerror="this.src='https://via.placeholder.com/400x200/e2e8f0/64748b?text=Shop'">
                    <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                    <div class="absolute bottom-2 left-3 right-3 flex justify-between items-end">
                        <div class="text-white">
                            <h3 class="font-bold text-lg leading-tight">${shop.name}</h3>
                            <p class="text-xs text-gray-300 line-clamp-1">${shop.address}</p>
                        </div>
                        <div class="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center border border-white/30">
                            <i class="fa-solid fa-chevron-right text-sm"></i>
                        </div>
                    </div>
                    <div class="absolute top-2 left-2 text-white/90 text-[8px] font-bold tracking-widest uppercase drop-shadow-md backdrop-blur-sm bg-black/40 px-2 py-0.5 rounded">WICKRAMANAYAKE GROUP (PVT) LTD.</div>
                </div>
                <div class="p-4 bg-white flex justify-between items-center">
                    <div>
                        <p class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Balance to take</p>
                        <p class="font-bold ${outstanding > 0 ? 'text-red-600' : 'text-green-600'} text-lg leading-none">${formatCurrency(outstanding)}</p>
                    </div>
                </div>
            `;
            list.appendChild(card);
        });
    }

    document.getElementById('rep-search-shops').addEventListener('input', (e) => renderRepShops(e.target.value));

    window.openVisitModal = (shop) => {
        document.getElementById('visit-shop-id').value = shop.id;
        document.getElementById('visit-shop-name').textContent = shop.name;
        document.getElementById('visit-shop-contact').textContent = shop.contact || 'No Contact Provided';
        document.getElementById('visit-shop-outstanding').textContent = formatCurrency(shop.outstanding || 0);
        document.getElementById('visit-payment').value = '';
        document.getElementById('visit-notes').value = '';
        
        openModal('visit-modal');
    };

    window.submitCollection = () => {
        const shopId = document.getElementById('visit-shop-id').value;
        const shopName = document.getElementById('visit-shop-name').textContent;
        const paymentInput = document.getElementById('visit-payment').value;
        const notes = document.getElementById('visit-notes').value.trim();
        
        const paymentAmount = Number(paymentInput) || 0;

        if(paymentAmount <= 0 && notes === '') {
            showToast('Please enter a payment amount or visit notes.', 'error');
            return;
        }

        // Passing negative payment to decrease outstanding balance in appState.logOrder
        appState.logOrder(
            appState.data.currentUser.id, 
            appState.data.currentUser.name, 
            shopId, 
            shopName, 
            [], // No items, just collection
            0, // Cost
            -paymentAmount, // Negative sale reduces outstanding
            0, // No gain
            notes || `Collected payment of ${formatCurrency(paymentAmount)}`
        );
        
        closeModal('visit-modal');
        showToast('Visit & Payment recorded successfully!');
        renderRepShops(document.getElementById('rep-search-shops').value);
    };

    document.querySelector('.logout-btn').addEventListener('click', () => {
        appState.logout();
        window.location.href = 'index.html';
    });

    renderRepShops();
});
