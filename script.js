// script.js - Lógica com Upload de Imagens e persistência no LocalStorage

// Produtos iniciais usam um ícone padrão caso não tenham imagem em arquivo
const defaultProducts = [
    { id: 1, title: "Difusor De Escape 2 Pol C/ponteira Em Inox C/controle", category: "Difusores", price: 480.00, link: "https://www.mercadolivre.com.br", image: "" },
    { id: 2, title: "Difusor De Escape Up Tsi / Polo Tsi C/controle", category: "Difusores", price: 425.00, link: "https://www.mercadolivre.com.br", image: "" },
    { id: 3, title: "Difusor De Escape 2.5 Pol S/ponteira Aço Inox Via Botão", category: "Difusores", price: 380.00, link: "https://www.mercadolivre.com.br", image: "" },
    { id: 4, title: "Difusor De Escape Up Tsi P/ Downpipe C/controle", category: "Downpipes", price: 487.00, link: "https://www.mercadolivre.com.br", image: "" },
    { id: 6, title: "Controle Remoto P/ Difusor De Escape Bypass", category: "Controles e Componentes", price: 80.00, link: "https://www.mercadolivre.com.br", image: "" },
    { id: 7, title: "Kit Via Botão Universal P/ Difusor De Escape", category: "Controles e Componentes", price: 100.00, link: "https://www.mercadolivre.com.br", image: "" },
    { id: 8, title: "Adaptador Pressurização Tsi 1.0", category: "Acessórios", price: 140.00, link: "https://www.mercadolivre.com.br", image: "" }
];

if (!localStorage.getItem('bypass_db_products')) {
    localStorage.setItem('bypass_db_products', JSON.stringify(defaultProducts));
}

let currentCategory = 'Todos';

function getProducts() {
    return JSON.parse(localStorage.getItem('bypass_db_products'));
}

function saveProducts(products) {
    localStorage.setItem('bypass_db_products', JSON.stringify(products));
    render();
}

function switchPage(page) {
    if (page === 'loja') {
        document.getElementById('page-loja').classList.remove('hidden');
        document.getElementById('page-admin').classList.add('hidden');
        document.getElementById('nav-loja').classList.add('active');
        document.getElementById('nav-admin').classList.remove('active');
    } else {
        document.getElementById('page-loja').classList.add('hidden');
        document.getElementById('page-admin').classList.remove('hidden');
        document.getElementById('nav-loja').classList.remove('active');
        document.getElementById('nav-admin').classList.add('active');
    }
    render();
}

function filterCategory(cat) {
    currentCategory = cat;
    document.getElementById('categoryTitle').innerText = cat === 'Todos' ? 'Todos os Produtos' : cat;
    
    const items = document.querySelectorAll('#categoryList li');
    items.forEach(li => {
        if(li.innerText.includes(cat) || (cat === 'Todos' && li.innerText.includes('Todos'))) {
            li.classList.add('active');
        } else {
            li.classList.remove('active');
        }
    });

    renderLoja();
}

// Cadastro de novo item processando o arquivo de imagem recebido
function handleProductSubmit(e) {
    e.preventDefault();
    const title = document.getElementById('prodTitle').value;
    const category = document.getElementById('prodCategory').value;
    const price = parseFloat(document.getElementById('prodPrice').value);
    const link = document.getElementById('prodLink').value;
    const imageInput = document.getElementById('prodImage');

    if (imageInput.files && imageInput.files[0]) {
        const reader = new FileReader();
        
        // Converte o arquivo de imagem em uma string de texto Base64
        reader.onload = function(event) {
            const base64Image = event.target.result;

            const products = getProducts();
            const newProduct = {
                id: Date.now(),
                title: title,
                category: category,
                price: price,
                link: link,
                image: base64Image // Guarda a imagem convertida aqui
            };

            products.push(newProduct);
            saveProducts(products);

            document.getElementById('productForm').reset();
            alert('Produto e imagem cadastrados com sucesso!');
        };
        
        reader.readAsDataURL(imageInput.files[0]);
    }
}

function editProductLink(id) {
    const products = getProducts();
    const product = products.find(p => p.id === id);
    
    if (product) {
        const novoLink = prompt(`Cole o novo link do Mercado Livre para:\n"${product.title}"`, product.link);
        if (novoLink !== null && novoLink.trim() !== "") {
            product.link = novoLink.trim();
            saveProducts(products);
            alert('Link atualizado!');
        }
    }
}

function deleteProduct(id) {
    if(confirm('Tem certeza que deseja remover este produto?')) {
        let products = getProducts();
        products = products.filter(p => p.id !== id);
        saveProducts(products);
    }
}

// Renderizar a vitrine da loja com suporte a imagens reais
function renderLoja() {
    const grid = document.getElementById('productsGrid');
    grid.innerHTML = '';
    const products = getProducts();

    const filtered = products.filter(p => currentCategory === 'Todos' || p.category === currentCategory);

    if(filtered.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #718096; padding: 40px 0;">Nenhum produto cadastrado nesta categoria.</p>';
        return;
    }

    filtered.forEach(p => {
        const item = document.createElement('div');
        item.className = 'product-item';
        
        // Define se exibe a imagem real enviada ou a engrenagem padrão antiga
        const imgDisplay = p.image 
            ? `<img src="${p.image}" alt="${p.title}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px 8px 0 0;">`
            : `<span style="font-size: 40px;">⚙️</span>`;

        item.innerHTML = `
            <div class="product-img-container" style="display: flex; align-items: center; justify-content: center; background: #f7fafc;">
                ${imgDisplay}
                <span class="product-img-info" style="z-index: 2;">${p.category}</span>
            </div>
            <div class="product-info">
                <div class="product-title">${p.title}</div>
                <div class="product-price">R$ ${p.price.toFixed(2).replace('.', ',')}</div>
                <a href="${p.link}" target="_blank" class="btn btn-primary" style="text-decoration: none;">Ver no Mercado Livre</a>
            </div>
        `;
        grid.appendChild(item);
    });
}

// Renderizar a tabela no painel admin exibindo miniaturas
function renderAdmin() {
    const tbody = document.getElementById('adminTableBody');
    tbody.innerHTML = '';
    const products = getProducts();

    products.forEach(p => {
        const tr = document.createElement('tr');
        
        const miniImg = p.image 
            ? `<img src="${p.image}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px;">`
            : `⚙️`;

        tr.innerHTML = `
            <td style="text-align: center; vertical-align: middle;">${miniImg}</td>
            <td><strong>${p.title}</strong></td>
            <td>${p.category}</td>
            <td>R$ ${p.price.toFixed(2).replace('.', ',')}</td>
            <td><a href="${p.link}" target="_blank" style="color: #3fa9e5; font-size: 13px; font-weight: 600;">Ver link</a></td>
            <td>
                <button class="btn" style="padding: 5px 10px; font-size: 12px; width: auto; display: inline-block; background-color: #3fa9e5; color: white; margin-right: 5px;" onclick="editProductLink(${p.id})">Editar Link</button>
                <button class="btn btn-danger" style="padding: 5px 10px; font-size: 12px; width: auto; display: inline-block;" onclick="deleteProduct(${p.id})">Excluir</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function render() {
    renderLoja();
    renderAdmin();
}

window.onload = function() {
    render();
};