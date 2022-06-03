import { getYesToken } from '../api.js';
import { addCommas, getNode } from '../useful-functions.js';
import * as Api from '/api.js';

const orderList = getNode('.order-list');
const modal = getNode('.orderModal');
const modalButton = getNode('.orderModal .close-button');
const orderlistWrap = getNode('.orderlist-wrap');
const modalBody = getNode('.orderModal .modal-card-body');
const searchButton = getNode('.search-button');
const searchInput = getNode('.search-input');
const createOrderDetail = (products) => {
  return products
    .map((product) => {
      return `
    <tbody>
      <td><img class="order-img" src=${product.productImg} alt="상품 이미지"></td>
      <td>${product.productName}</td>
      <td>${product.count}</td>
      <td>${product.productPrice}</td>
    </tbody>
    `;
    })
    .join('');
};

const createOrderModal = (item) => {
  const { shortId, userId, address, products, phoneNumber, totalPrice, createdAt } = item;
  let orderDetail = '';

  if (!products.length) orderDetail = createOrderDetail([products]);
  else orderDetail = createOrderDetail(products);

  return `
  <div class="body-wrap">
          <div class="order-detail-info">
            <span class="info-order-number">No. <strong>${shortId}</strong></span>
            <span class="info-order-date">${createdAt.substr(0, 10)}</span>
          </div>
          <div class="order-detail-list">
            <table class="table is-hoverable is-fullwidth">
              <thead>
                <tr>
                  <th>이미지</th>
                  <th>상품명</th>
                  <th>수량</th>
                  <th>금액</th>
                </tr>
              </thead>
              ${orderDetail}
            </table>
          </div>
          <hr>
          <div class="order-detail-user-info">
            <ul>
              <li><strong>배송지</strong></li>
              <li><strong>주문자명</strong></li>
              <li><strong>전화번호</strong></li>
            </ul>
            <ul>
              <li>${address.postalCode + ' ' + address.address1 + ' ' + address.address2}</li>
              <li>${userId}</li>
              <li>${phoneNumber}</li>
            </ul>
          </div>
          <hr>
          <div class="order-detail-account">
            <button class="button is-danger is-small order-delete-button">주문 삭제</button>
            <span><strong>총 주문금액: ${addCommas(totalPrice)}</strong></span>
          </div>
        </div>
  `;
};

const onDeleteOrder = async (e) => {
  e.preventDefault();

  const ok = window.confirm('주문 내역을 정말 삭제하시겠습니까?');
  if (!ok) return;

  try {
    const orderId = e.target.parentNode.parentNode.querySelector('.info-order-number strong').innerText;
    console.log(orderId);
    await Api.deleteYesToken('/api/orders', orderId);
    alert('주문 내역이 삭제되었습니다.');
    window.location.reload();
  } catch (err) {
    console.log(err.message);
  }
  ƒ;
};

const addOrderDeleteEvent = () => {
  getNode('.order-delete-button').addEventListener('click', onDeleteOrder);
};

const renderOrderModal = (item) => {
  modalBody.innerHTML = createOrderModal(item);
  addOrderDeleteEvent();
};

const viewDetailModal = (e) => {
  if (!e.target.classList.contains('open-modal')) return;
  const orderId = e.target.parentNode.parentNode.parentNode.querySelector('.ordershortId').innerText;
  const orderDate = getNode('.order_date').innerText;
  modalBody.innerHTML = '';
  getOrderDetail(orderId, orderDate);
  modal.classList.add('is-active');
};

const closeModal = () => {
  modal.classList.remove('is-active');
};

function addAllEvents() {
  modalButton.addEventListener('click', closeModal);
  orderList.addEventListener('click', viewDetailModal);
  searchButton.addEventListener('click', searchProducts);
}

const createOrderListElement = (item) => {
  const { shortId, products, createdAt } = item;

  const tr = document.createElement('tr');

  tr.innerHTML = `
    <th class="ordershortId">${shortId}</th>
    <td>${products.length ?? '1'} 건의 주문내역</td>
    <td class="order_date">${createdAt.substr(0, 10)}</td>
    <td>
    <a class="order-detail-button">
        <span class="material-icons open-modal">
          open_in_full
        </span>
      </a>
    </td>
  `;

  return tr;
};

const renderAllOrderAllList = (orderList) => {
  orderlistWrap.innerHTML = '';
  orderList.data.forEach((item) => {
    const { shortId, userId, phoneNumber, products, totalPrice, createdAt, address } = item;
    const orders = createOrderListElement({ shortId, userId, phoneNumber, products, totalPrice, createdAt, address });
    orderlistWrap.appendChild(orders);
  });
};

const getOrderAllList = async () => {
  try {
    const result = await Api.getYesToken('/api/orders/list');
    renderAllOrderAllList(result);
  } catch (err) {
    alert(err.message);
    window.location.href = '/admin/login';
  }
};

const getOrderDetail = async (orderId) => {
  try {
    const result = await Api.getYesToken('/api/orders', orderId);
    renderOrderModal(result.data);
  } catch (err) {
    console.log(err);
  }
};

getOrderAllList();

// 검색
function searchProducts(e) {
  e.preventDefault();
  const searchInput = getNode('.search-input');
  const value = searchInput.value;

  if (!value) return;

  getSearchResult(value);
}

async function getSearchResult(target) {
  try {
    const datas = await fetch(`/api/search?keyword=${target}`);
    const data = await datas.json();
    showProducts(data.data, '검색', target);
  } catch (err) {
    console.log(err.message);
  }
}

// 상품추가 모달창 활성화하기
const addProduct = getNode('.addProduct');
const modalAddProduct = getNode('.modal-addProduct');
const addProductClose = getNode('.modal-addProduct button.delete');
// 상품추가 버튼 클릭시 활성화
addProduct.addEventListener('click', () => {
  modalAddProduct.classList.add('is-active');
});
// 닫기버튼 클릭시 비활성화
addProductClose.addEventListener('click', () => {
  modalAddProduct.classList.remove('is-active');
});

// 상품추가 모달
function addPostModal() {
  getOptionCategory('.category-option');
  const addProductBtn = getNode('.addProductBtn');
  addProductBtn.addEventListener('click', () => {
    postProductToApi('.modal-addProduct');
  });
}
addPostModal();
// 상품추가 - 카테고리 옵션 렌더링
async function getOptionCategory(renderNode, category = '') {
  const data = await Api.getYesToken('/api/categories');
  const categoryOptions = getNode(renderNode); // 모달 카테고리 표
  categoryOptions.innerHTML = '';
  for (let i = 0; i < data.data.length; i++) {
    if (category !== '') {
      if (category === data.data[i]._id) {
        categoryOptions.innerHTML += `<option selected id="${data.data[i]._id}">${data.data[i].label}</option>`;
      } else {
        categoryOptions.innerHTML += `<option id="${data.data[i]._id}">${data.data[i].label}</option>`;
      }
    } else {
      // 모달창 카테고리 렌더링
      if (i === 0)
        categoryOptions.innerHTML += `<option selected id="${data.data[i]._id}">${data.data[i].label}</option>`;
      else categoryOptions.innerHTML += `<option id="${data.data[i]._id}">${data.data[i].label}</option>`;
    }
  }
}

// 상품 추가하기 - Api.post 통신
async function postProductToApi(node, productId = '') {
  const image = getNode(`${node} .image`).value;
  const detailImage = getNode(`${node} .detailImage`).value;
  const category = getNode(`${node} .category-option`).value;
  const categoryId = getNode(`.${category}`).id;
  const productName = getNode(`${node} .productName`).value;
  const description = getNode(`${node} .description`).value;
  const price = getNode(`${node} .price`).value;
  const company = getNode(`${node} .company`).value;
  const data = {
    image: image,
    detailImage: detailImage,
    categoryId: categoryId,
    productName: productName,
    description: description,
    price: price,
    company: company,
  };
  console.log(typeof node, node);
  if (node === '.modal-addProduct') {
    await Api.postYesToken('/api/products', data);
    location.reload();
  } else if (node === '.productEditModal') {
    await Api.patchYesToken('/api/products', productId, data);
    getProductAll(1);
  }
}
// 상품 편집하기 모달 페이지네이션

// 상품 편집하기 모달
const editProductBtn = getNode('.editProductBtn');
const productEditModal = getNode('.productEditModal');
const closeProductEdit = getNode('.productEditModal .delete');
editProductBtn.addEventListener('click', () => {
  productEditModal.classList.add('is-active');
});
closeProductEdit.addEventListener('click', () => {
  productEditModal.classList.remove('is-active');
  goBackEditModal();
  getProductAll(1);
  getModalCategory();
});
// 상품 편집 모달 - 상품목록 api 통신
const productList = getNode('.productList');
// 카테고리별 상품목록 + 페이네이션 하기- Api.get 통신
async function getProductCategory(page, categoryName) {
  const datas = await fetch(`/api/categories/products/${categoryName}?page=${page}`);
  const data = await datas.json();
  showProducts(data.data, categoryName);
}
// 전체보기 상품목록 + 페이지네이션 - Api.get 통신
async function getProductAll(page) {
  const datas = await fetch(`/api/products/admin?page=${page}`);
  const data = await datas.json();
  showProducts(data.data);
}
async function getProductSearch(page, keyword) {
  const datas = await fetch(`/api/search?keyword=${keyword}&page=${page}`);
  const data = await datas.json();
  showProducts(data.data, '검색', keyword);
}
async function showProducts(data, categoryId = '', keyword = '') {
  const productList = getNode('.productList');
  productList.innerHTML = '';
  data.products.map((product) => {
    let addDate = product.createdAt.substr(0, 10);
    productList.innerHTML += ` <td><span class="${product.shortId} updateProdcutBtn material-icons open-modal">
    open_in_full</span></td><td>${product.productName}</td>
  <td>${product.company}</td>
  <td>${addDate}</td>
  <td><div class="delProductBtn button is-danger is-small" id="${product.shortId}">삭제</td>`;
  });
  // 페이지네이션

  const pagenationList = getNode('.pagination-list');
  pagenationList.innerHTML = '';
  for (let i = 1; i <= data.totalPage; i++) {
    pagenationList.innerHTML += `<li><a class="pagination-link" aria-label="Goto page ${i}">${i}</a></li>`;
  }
  // 페이지 네이션 링크
  const pagenationLink = document.querySelectorAll('.pagination-link');
  for (let i = 0; i < data.totalPage; i++) {
    // 전체보기가 아닐떄
    // 카테고리 id 값으로
    if (categoryId === '검색') {
      pagenationLink[i].addEventListener('click', () => {
        getProductSearch(i + 1, keyword);
      });
    } else if (categoryId !== '') {
      pagenationLink[i].addEventListener('click', () => {
        getProductCategory(i + 1, categoryId);
      });
    } else {
      pagenationLink[i].addEventListener('click', () => {
        getProductAll(i + 1);
      });
    }
  }

  const delProductBtns = document.querySelectorAll('.delProductBtn');
  const updateProdcutBtn = document.querySelectorAll('.updateProdcutBtn');
  for (let i = 0; i < delProductBtns.length; i++) {
    delProductBtns[i].addEventListener('click', delProduct);
    updateProdcutBtn[i].addEventListener('click', updateProduct);
  }
}
// getProductList();
// 상품 삭제 api
async function delProduct(e) {
  await Api.deleteYesToken('/api/products', e.target.id);
  productList.innerHTML = '';
  getProductAll(1);
}
// 상품수정 페이지 렌더링 - 기존데이터 api로 통신하기
async function updateProduct(e) {
  const datas = await getYesToken('/api/products', e.target.classList[0]);
  const product = datas.data;
  console.log('편집전편집전', product);
  const productEditModal = getNode('.productEditModal .modal-card-body');
  const productEditFoot = getNode('.productEditModal .modal-card-foot');
  productEditModal.innerHTML = '';
  productEditModal.innerHTML = `<div class="is-size-5">대표이미지</div>
  <input class="input image" type="text" name="image" value="${product.image}">
  <div class="is-size-5">상세이미지</div>
  <input class="input detailImage" type="text" name="detailImage" value="${product.detailImage}">
  <div>카테고리</div>
  <div class="control has-icons-left">
    <div class="select">
      <select id="total-count" class="category-option">${product.categoryId}</select>
    </div>
  </div>
  <div>상품이름</div>
  <input class="input productName" type="text" name="productName" value="${product.productName}">
  <div>상품설명</div>
  <input class="input description" type="textarea" name="description" value="${product.description}">
  <div>price</div>
  <input class="input price" type="number" name="price" value="${product.price}">
  <div>제조사</div>
  <input class="input company" type="text" name="company" value="${product.company}">
`;
  productEditFoot.innerHTML =
    '<div><button class="button is-medium goBackList">뒤로가기</button><button class="button is-success is-medium saveUpdateList">변경사항 저장</button></div>';
  //카테고리 렌더링
  const originCategory = getNode('.productEditModal .category-option').textContent;
  getOptionCategory('.productEditModal .category-option', originCategory);
  // 뒤로가기 버튼
  const goBackBtn = getNode('.goBackList');
  goBackBtn.addEventListener('click', goBackEditModal);
  //변경사항 저장
  const saveUpdateList = getNode('.saveUpdateList');
  saveUpdateList.addEventListener('click', () => {
    postProductToApi('.productEditModal', product.shortId);
    goBackEditModal();
  });
}

// 뒤로가기 버튼 클릭시 이벤트
function goBackEditModal() {
  const productEditModal = getNode('.productEditModal .modal-card-body');
  const productEditFoot = getNode('.productEditModal .modal-card-foot');
  productEditFoot.innerHTML = `<div class="bottom">
  <nav class="pagination is-centered" role="navigation" aria-label="pagination">
    <ul class="pagination-list">
    </ul>
  </nav> 
</div>`;
  productEditModal.innerHTML = `<div class="search-wrap">
  <form>
    <div>
      <input class="is-medium search-input" type="text" placeholder="상품명을 입력하세요.">
      <button class="is-medium search-button" type="submit">
        <span class="material-icons">
          search
        </span>
      </button>
    </div>
  </form>
</div><table class="table is-hoverable is-fullwidth productTable">
  <thead>
    <tr>
      <th>수정</th>
      <th>상품명</th>
      <th>제조사</th>
      <th>등록일자</th>
      <th>삭제</th>
    </tr>
  </thead>
  <tbody class="productList">
  </tbody>
</table>`;
  getProductAll(1);
  const searchButton = getNode('.search-button');
  const searchInput = getNode('.search-input');
  searchButton.addEventListener('click', searchProducts);
}

// 카테고리 모달 렌더링 - Api.get 통신
async function getModalCategory() {
  const data = await Api.getYesToken('/api/categories');
  const categoryModalList = document.querySelector('.category-modal-list'); // 모달 카테고리 표
  categoryModalList.innerHTML = '';
  for (let i = 0; i < data.data.length; i++) {
    // 모달창 카테고리 렌더링
    if (data.data[i].active === 'active') {
      categoryModalList.innerHTML += `<tr><td class="categoryName" id="${data.data[i].shortId}" name="categoryName">${data.data[i].label}</td>
      <td><button class="button is-warning edit-category-button">수정</button></td>
      <td><button class="button is-info useActive-button">비활성화</button></td>
      <td><button class="button is-danger del-category-button">삭제</button></td></tr>`;
    } else {
      categoryModalList.innerHTML += `<tr><td class="categoryName" id="${data.data[i].shortId}" name="categoryName">${data.data[i].label}</td>
      <td><button class="button is-warning edit-category-button">수정</button></td>
      <td><button class="button useActive-button">활성화</button></td>
      <td><button class="button is-danger del-category-button">삭제</button></td></tr>`;
    }
  }
  // 카테고리 수정버튼 클릭스 input 태그로 변경하고 button 바꾸기 + 삭제하기
  const editCategoryBtn = document.querySelectorAll('.edit-category-button'); //수정하기 버튼
  const delCategoryBtn = document.querySelectorAll('.del-category-button'); // 삭제하기 버튼
  const useActiveBtn = document.querySelectorAll('.useActive-button'); // 활성화 여부 버튼

  for (let i = 0; i < editCategoryBtn.length; i++) {
    editCategoryBtn[i].addEventListener('click', updateCategory);
    delCategoryBtn[i].addEventListener('click', delCategory);
    useActiveBtn[i].addEventListener('click', useActiveCategory);
  }

  // 카테고리 추가하기
  const addCategoryTrigger = getNode('.add-category-trigger');
  addCategoryTrigger.addEventListener('click', showAddCategoryForm);
}
getModalCategory();

// 카테고리 활성화 비활성화 이벤트
async function useActiveCategory(e) {
  const categoryNode = e.target.parentNode.parentNode.firstChild;
  console.log(categoryNode, '활성화 이벤트확인');
  const categoryId = categoryNode.getAttribute('id');
  if (e.target.classList.contains('is-info')) {
    e.target.classList.remove('is-info');
    e.target.innerHTML = '활성화';
    await Api.patchYesToken('/api/categories', categoryId, { active: 'disabled' });
  } else {
    e.target.classList.add('is-info');
    e.target.innerHTML = '비활성화';
    await Api.patchYesToken('/api/categories', categoryId, { active: 'active' });
  }
  getModalCategory();
}

// 카테고리 추가하기 Form
function showAddCategoryForm() {
  const addSection = getNode('#modal-editCategory footer');
  addSection.innerHTML =
    '<input type="text" class="input addCategoryName"><button class="button is-dark add-category-button">추가</button>';

  const addCategoryBtn = getNode('.add-category-button');
  addCategoryBtn.addEventListener('click', addCatgoryToApi);
}

// 카테고리 추가 - Api.post통신
async function addCatgoryToApi() {
  const addCategoryName = getNode('.addCategoryName').value;
  console.log('추가하려는 카테고리', addCategoryName);
  await Api.postYesToken('/api/categories', { label: addCategoryName });
  const categoryModalList = document.querySelector('.category-modal-list');
  categoryModalList.innerHTML = '';
  getModalCategory();
  showAddCategoryForm();
}
// 카테고리 삭제 - Api.delete통신
async function delCategory(e) {
  const categoryNode = e.target.parentNode.parentNode.firstChild;
  const categoryId = categoryNode.getAttribute('id');
  const categoryName = categoryNode.textContent;
  const deleteProduct = await Api.getYesToken('/api/categories/products', categoryId);
  if (deleteProduct.data.products.length !== 0) {
    alert(`해당 카테고리에 총 ${deleteProduct.data.products.length} 개의 상품이 존재합니다. 상품 수정후 사용해주세요!`);
  } else {
    await Api.deleteYesToken('/api/categories', categoryId, { categoryName });
    const categoryModalList = document.querySelector('.category-modal-list');
    categoryModalList.innerHTML = '';
    getModalCategory();
  }
}
// 카테고리 수정- Api.patch통신
async function updateCategory(e) {
  const categoryNode = e.target.parentNode.parentNode.firstChild;
  const categoryId = categoryNode.getAttribute('id');
  // console.log('제목부분 찾아라~',categoryNode,categoryId)
  const btnClass = e.target.classList;
  if (btnClass.contains('is-warning')) {
    //수정버튼일때
    categoryNode.innerHTML = `<input type="text" value="${categoryNode.textContent}" class="input editName"></input>`;
    btnClass.remove('is-warning');
    btnClass.add('is-success');
    e.target.innerHTML = '저장';
  } else {
    //저장버튼일때 + 수정된 카테고리이름 API로 통신하기
    btnClass.remove('is-success');
    btnClass.add('is-warning');
    const updatedName = getNode('.editName').value;
    categoryNode.innerHTML = updatedName;
    e.target.innerHTML = '수정';
    try {
      await Api.patchYesToken('/api/categories', categoryId, { label: updatedName });
    } catch (error) {
      console.log(error.message);
    }
  }
}

// 카테고리편집 모달창 활성화
// 카테고리편집 버튼 클릭시 -> 모달창
const modalEditCategory = getNode('#modal-editCategory'); // 모달창
getNode('.editCategory').onclick = () => {
  modalEditCategory.classList.add('is-active');
};
// 닫기 아이콘 클릭시 모달창 비활성화
const editClose = getNode('#modal-editCategory button.delete'); //닫기버튼
editClose.onclick = () => {
  modalEditCategory.classList.remove('is-active');
  location.reload();
};

getProductAll(1);
addAllEvents();
