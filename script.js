// script.js - Lógica, edição e persistência de dados no LocalStorage
const defaultProducts = [
    { id: 1, title: "Difusor De Escape 2 Pol C/ponteira Em Inox C/controle", category: "Difusores", price: 480.00, link: "https://www.mercadolivre.com.br" },
    { id: 2, title: "Difusor De Escape Up Tsi / Polo Tsi C/controle", category: "Difusores", price: 425.00, link: "https://www.mercadolivre.com.br" },
    { id: 3, title: "Difusor De Escape 2.5 Pol S/ponteira Aço Inox Via Botão", category: "Difusores", price: 380.00, link: "https://www.mercadolivre.com.br" },
    { id: 4, title: "Difusor De Escape Up Tsi P/ Downpipe C/controle", category: "Downpipes", price: 487.00, link: "https://www.mercadolivre.com.br" },
    { id: 5, title: "Luva De Escape Emenda Inox 3 Pol X 2.12 Pol", category: "Luvas e Emendas", price: 180.00, link: "https://www.mercadolivre.com.br" },
    { id: 6, title: "Controle Remoto P/ Difusor De Escape Bypass", category: "Controles e Componentes", price: 80.00, link: "https://www.mercadolivre.com.br" },
    { id: 7, title: "Kit Via Botão Universal P/ Difusor De Escape", category: "Controles e Componentes", price: 100.00, link: "https://www.mercadolivre.com.br" },
    { id: 8, title: "Adaptador Pressurização Tsi 1.0", category: "Acessórios", price: 140.00, link: "https://www.mercadolivre.com.br" }
];

// Inicia o LocalStorage se ele estiver vazio
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

// Navegação entre as telas (Loja / Admin)
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

// Filtro por categorias da barra lateral
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

// Cadastro de novo item vindo do formulário Admin
function handleProductSubmit(e) {
    e.preventDefault();
    const title = document.getElementById('prodTitle').value;
    const category = document.getElementById('prodCategory').value;
    const price = parseFloat(document.getElementById('prodPrice').value);
    const link = document.getElementById('prodLink').value;

    const products = getProducts();
    const newProduct = {
        id: Date.now(),
        title: title,
        category: category,
        price: price,
        link: link
    };

    products.push(newProduct);
    saveProducts(products);

    document.getElementById('productForm').reset();
    alert('Produto salvo com sucesso no banco de dados local com seu link!');
}

// NOVA FUNÇÃO: Editar apenas o link de um produto existente
function editProductLink(id) {
    const products = getProducts();
    const product = products.find(p => p.id === id);
    
    if (product) {
        const novoLink = prompt(`Cole o novo link do Mercado Livre para:\n"${product.title}"`, product.link);
        
        // Se o usuário não cancelar e digitar algo, salva o link
        if (novoLink !== null && novoLink.trim() !== "") {
            product.link = novoLink.trim();
            saveProducts(products);
            alert('Link atualizado com sucesso!');
        }
    }
}

// Excluir produto do banco
function deleteProduct(id) {
    if(confirm('Tem certeza que deseja remover este produto?')) {
        let products = getProducts();
        products = products.filter(p => p.id !== id);
        saveProducts(products);
    }
}

// Renderizar a vitrine da loja
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
        item.innerHTML = `
            <div class="product-img-container">
                ⚙️
                <span class="product-img-info">${p.category}</span>
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

// Renderizar a tabela no painel admin
function renderAdmin() {
    const tbody = document.getElementById('adminTableBody');
    tbody.innerHTML = '';
    const products = getProducts();

    products.forEach(p => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${p.title}</strong></td>
            <td>${p.category}</td>
            <td>R$ ${p.price.toFixed(2).replace('.', ',')}</td>
            <td><a href="${p.link}" target="_blank" style="color: #3fa9e5; font-size: 13px; font-weight: 600;">Ver link atual</a></td>
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

// Inicialização ao carregar a página
window.onload = function() {
    render();
};