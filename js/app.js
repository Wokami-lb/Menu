/**
 * WOKAMI - Aplicación Principal
 * =============================
 * Este archivo contiene toda la lógica de negocio del menú digital de Wokami.
 * 
 * Módulos principales:
 * 1. Estado y Configuración
 * 2. Carrito de Compras
 * 3. Lógica de Horarios (ABIERTO/CERRADO)
 * 4. Promociones Dinámicas
 * 5. Cupones de Descuento
 * 6. Barra de Progreso (Gamification)
 * 7. Modales (Preferencias y Proteínas)
 * 8. Integración con WhatsApp
 * 9. Renderizado Dinámico
 * 10. Utilidades y Helpers
 */

// ============================================
// 1. ESTADO Y CONFIGURACIÓN
// ============================================

/**
 * Estado global de la aplicación
 */
const AppState = {
  // Carrito de compras - array de productos
  cart: [],
  
  // Cupón aplicado actualmente
  appliedCoupon: null,
  
  // Datos de la selección de proteínas actual
  currentProteinRequest: null,
  
  // Configuración desde MENU_DATA
  config: MENU_DATA.config
};

/**
 * Constantes de la aplicación
 */
const CONSTANTS = {
  // Meta para Kushiague gratis
  KUSHIAGUE_GOAL: 350,
  
  // Número de WhatsApp para pedidos
  PHONE_NUMBER: '5214433580280',
  
  // Días de la semana
  DAYS: {
    0: 'Domingo',
    1: 'Lunes',
    2: 'Martes',
    3: 'Miércoles',
    4: 'Jueves',
    5: 'Viernes',
    6: 'Sábado'
  }
};

// ============================================
// 2. CARRITO DE COMPRAS
// ============================================

/**
 * Agrega un producto al carrito
 * @param {string} name - Nombre del producto
 * @param {number} price - Precio del producto
 * @param {string} category - Categoría del producto
 */
function addToCart(name, price, category = 'other') {
  AppState.cart.push({
    name: name,
    price: price,
    category: category,
    id: Date.now() + Math.random().toString(36).substr(2, 9)
  });
  
  updateCartButton();
  showToast(`✅ Agregado: ${name}`);
  
  // Efecto de confeti si alcanza la meta
  const { subtotal } = calculateCart();
  if (subtotal >= CONSTANTS.KUSHIAGUE_GOAL) {
    showToast('🎉 ¡Felicidades! Has ganado una Kushiague GRATIS');
  }
}

/**
 * Elimina un producto del carrito por su índice
 * @param {number} index - Índice del producto en el carrito
 */
function removeFromCart(index) {
  const removedItem = AppState.cart[index];
  AppState.cart.splice(index, 1);
  
  updateCartButton();
  renderCartItems();
  
  if (AppState.cart.length === 0) {
    toggleModal();
  } else {
    showToast(`❌ Eliminado: ${removedItem.name}`);
  }
}

/**
 * Limpia todo el carrito
 */
function clearCart() {
  AppState.cart = [];
  AppState.appliedCoupon = null;
  updateCartButton();
}

/**
 * Agrega Kushiagues desde el selector
 */
function addKushiageFromSelect() {
  const select = document.getElementById('kushiage-select');
  if (select) {
    addToCart(`Kushiagues (${select.value})`, 65, 'entrada');
  }
}

/**
 * Agrega Galletas desde el selector
 */
function addCookieFromSelect() {
  const select = document.getElementById('cookie-select');
  if (select) {
    addToCart(`Galletas New York (${select.value})`, 45, 'postre');
  }
}

/**
 * Agrega Mochis desde el selector
 */
function addMochiFromSelect() {
  const select = document.getElementById('mochi-select');
  if (select) {
    addToCart(`Mochis (${select.value})`, 55, 'postre');
  }
}

/**
 * Agrega galletas desde el modal de preferencias
 */
function addCookieFromModal() {
  addToCart('Galletas New York (Red Velvet rellena de queso)', 45, 'postre');
  renderCartItems();
  updateModalTotals();
  
  // Feedback visual en el botón
  const btn = document.querySelector('#modal-cookie-upsell button');
  if (btn) {
    const originalText = btn.innerText;
    btn.innerText = '¡Listo!';
    btn.classList.add('bg-green-500');
    setTimeout(() => {
      btn.innerText = originalText;
      btn.classList.remove('bg-green-500');
    }, 1000);
  }
}

// ============================================
// 3. LÓGICA DE HORARIOS (ABIERTO/CERRADO)
// ============================================

/**
 * Actualiza el badge de estado según la hora actual
 * Wokami abre Miércoles (3) a Domingo (0) de 2:00 PM a 8:00 PM
 */
function updateStatusBadge() {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const hour = now.getHours();
  
  const statusBadge = document.getElementById('status-badge');
  if (!statusBadge) return;
  
  // Verificar si es día de apertura (Miércoles a Domingo)
  const isOpenDay = (dayOfWeek >= 3) || (dayOfWeek === 0);
  
  // Clases base
  const baseClass = 'status-badge';
  
  if (isOpenDay) {
    if (hour === 13) {
      // 1:00 PM - Abrimos pronto
      statusBadge.textContent = 'ABRIMOS PRONTO';
      statusBadge.className = `${baseClass} status-badge--soon`;
    } else if (hour >= 14 && hour < 19) {
      // 2:00 PM - 7:00 PM - Abierto
      statusBadge.textContent = 'ABIERTO';
      statusBadge.className = `${baseClass} status-badge--open`;
    } else if (hour === 19) {
      // 7:00 PM - Cerramos pronto
      statusBadge.textContent = 'CERRAMOS PRONTO';
      statusBadge.className = `${baseClass} status-badge--closing`;
    } else {
      // Fuera de horario - Cerrado
      statusBadge.textContent = 'CERRADO';
      statusBadge.className = `${baseClass} status-badge--closed`;
    }
  } else {
    // Lunes o Martes - Cerrado
    statusBadge.textContent = 'CERRADO';
    statusBadge.className = `${baseClass} status-badge--closed`;
  }
}

// ============================================
// 4. PROMOCIONES DINÁMICAS
// ============================================

/**
 * Actualiza el banner de promoción según el día de la semana
 */
function updateDailyPromo() {
  const now = new Date();
  const dayOfWeek = now.getDay();
  
  const promoBanner = document.getElementById('daily-promo');
  const promoText = document.getElementById('daily-promo-text');
  
  if (!promoBanner || !promoText) return;
  
  let promoMessage = '';
  let promoIcon = 'fa-bullhorn';
  
  // Promociones según el día
  switch (dayOfWeek) {
    case 3: // Miércoles
    case 4: // Jueves
      promoMessage = '🥢 Promo Wok & Drink: Compra cualquier Wok + Agua Fresca y ahorra $15.';
      promoIcon = 'fa-utensils';
      break;
      
    case 5: // Viernes
      promoMessage = '🔥 Viernes Premium: ¡Todos los Rollos Especiales a solo $125!';
      promoIcon = 'fa-fire';
      break;
      
    case 6: // Sábado
    case 0: // Domingo
      promoMessage = '👨‍👩‍👧‍👦 Finde Familiar: ¡$50 de descuento en compras mayores a $450!';
      promoIcon = 'fa-gift';
      break;
      
    default: // Lunes y Martes (Cerrado)
      promoMessage = '¡Nos vemos el miércoles! Horario: 2:00 PM a 8:00 PM.';
  }
  
  if (promoMessage) {
    promoText.innerHTML = `<i class="fas ${promoIcon} text-red-500 mr-2"></i>${promoMessage}`;
    promoBanner.classList.remove('hidden');
  }
}

// ============================================
// 5. CÁLCULO DE PRECIOS Y PROMOCIONES
// ============================================

/**
 * Calcula el subtotal, descuentos y total del carrito
 * Aplica promociones automáticas según el día
 * @returns {Object} - { subtotal, discount, total, details }
 */
function calculateCart() {
  const now = new Date();
  const day = now.getDay();
  
  let subtotal = 0;
  let discount = 0;
  const details = [];
  
  // Calcular subtotal
  AppState.cart.forEach(item => {
    subtotal += item.price;
  });
  
  // Filtrar items por categoría
  const wokItems = AppState.cart.filter(i => i.category === 'wok');
  const bebidas = AppState.cart.filter(i => i.name.includes('Agua Fresca'));
  const specialRolls = AppState.cart.filter(i => 
    i.category === 'rollo' && i.price === 150
  );
  
  // Promoción Miércoles (3) y Jueves (4): Wok & Drink
  if (day === 3 || day === 4) {
    const combosCount = Math.min(wokItems.length, bebidas.length);
    if (combosCount > 0) {
      const comboDiscount = combosCount * 15;
      discount += comboDiscount;
      details.push({
        type: 'Wok & Drink',
        amount: comboDiscount,
        description: `${combosCount} combo(s) Wok + Agua Fresca`
      });
    }
  }
  
  // Promoción Viernes (5): Special Friday
  if (day === 5) {
    if (specialRolls.length > 0) {
      const fridayDiscount = specialRolls.length * 25; // $150 -> $125
      discount += fridayDiscount;
      details.push({
        type: 'Viernes Premium',
        amount: fridayDiscount,
        description: `${specialRolls.length} rollo(s) especial(es) a $125`
      });
    }
  }
  
  // Promoción Sábado (6) y Domingo (0): Family Pack
  if (day === 6 || day === 0) {
    if (subtotal > 450) {
      discount += 50;
      details.push({
        type: 'Finde Familiar',
        amount: 50,
        description: 'Compra mayor a $450'
      });
    }
  }
  
  return {
    subtotal,
    discount,
    total: subtotal - discount,
    details
  };
}

// ============================================
// 6. CUPONES DE DESCUENTO
// ============================================

/**
 * Aplica un cupón de descuento
 * Valida reglas de negocio para cada cupón
 */
function applyCoupon() {
  const codeInput = document.getElementById('coupon-code');
  const messageEl = document.getElementById('coupon-message');
  const addressField = document.getElementById('delivery-address');
  
  if (!codeInput || !messageEl) return;
  
  const code = codeInput.value.trim().toUpperCase();
  const { discount } = calculateCart();
  const now = new Date();
  const day = now.getDay();
  const isWeekend = (day === 0 || day === 6);
  
  // Resetear estado
  AppState.appliedCoupon = null;
  if (addressField) {
    addressField.disabled = false;
    addressField.style.backgroundColor = '';
  }
  
  // No acumulable con otras promociones
  if (discount !== 0) {
    showCouponMessage('Este cupón no es acumulable con otras promociones.', 'error');
    updateModalTotals();
    return;
  }
  
  // Validar cupón
  switch (code) {
    case 'WOK5':
      AppState.appliedCoupon = 'WOK5';
      showCouponMessage('¡Cupón aplicado! (5% Descuento)', 'success');
      break;
      
    case 'PREPA10':
      if (isWeekend) {
        showCouponMessage('Válido solo entre semana (Mié-Vie).', 'error');
      } else {
        AppState.appliedCoupon = 'PREPA10';
        showCouponMessage('¡Cupón PREPA10 aplicado! (10% Descuento)', 'success');
        if (addressField) {
          addressField.value = 'Escuela Preparatoria Regional De La Barca UDEG';
          addressField.disabled = true;
        }
      }
      break;
      
    case 'FAMILIA':
      if (day !== 0) {
        showCouponMessage('Válido solo los domingos.', 'error');
      } else {
        AppState.appliedCoupon = 'FAMILIA';
        showCouponMessage('¡Cupón FAMILIA aplicado! (10% Descuento)', 'success');
      }
      break;
      
    default:
      showCouponMessage('Código inválido', 'error');
  }
  
  updateModalTotals();
}

/**
 * Muestra un mensaje de estado del cupón
 * @param {string} message - Mensaje a mostrar
 * @param {string} type - 'success' o 'error'
 */
function showCouponMessage(message, type) {
  const messageEl = document.getElementById('coupon-message');
  if (!messageEl) return;
  
  messageEl.className = `text-xs mt-1 font-bold ${type === 'success' ? 'text-green-600' : 'text-red-600'}`;
  messageEl.innerText = message;
}

/**
 * Calcula el descuento del cupón aplicado
 * @param {number} subtotal - Subtotal del carrito
 * @returns {number} - Monto del descuento
 */
function calculateCouponDiscount(subtotal) {
  if (!AppState.appliedCoupon) return 0;
  
  switch (AppState.appliedCoupon) {
    case 'WOK5':
      return Math.round(subtotal * 0.05);
    case 'PREPA10':
    case 'FAMILIA':
      return Math.round(subtotal * 0.10);
    default:
      return 0;
  }
}

// ============================================
// 7. BARRA DE PROGRESO (GAMIFICATION)
// ============================================

/**
 * Actualiza la barra de progreso hacia el Kushiague gratis
 * @param {number} currentTotal - Total actual del carrito
 */
function updateProgressBar(currentTotal) {
  const goal = CONSTANTS.KUSHIAGUE_GOAL;
  const percentage = Math.min((currentTotal / goal) * 100, 100);
  
  const progressBar = document.getElementById('progress-bar');
  const progressText = document.getElementById('progress-text');
  const progressAmount = document.getElementById('progress-amount');
  
  if (!progressBar || !progressText || !progressAmount) return;
  
  // Actualizar barra
  progressBar.style.width = `${percentage}%`;
  progressAmount.innerText = `$${currentTotal} / $${goal}`;
  
  // Estado completado o en progreso
  if (currentTotal >= goal) {
    progressBar.classList.remove('bg-red-600');
    progressBar.classList.add('bg-green-500');
    progressText.innerHTML = '🎉 ¡Felicidades! Ganaste una <span class="font-bold text-green-600">Kushiague GRATIS</span>';
    progressText.classList.add('text-green-700');
  } else {
    const remaining = goal - currentTotal;
    progressBar.classList.add('bg-red-600');
    progressBar.classList.remove('bg-green-500');
    progressText.innerHTML = `¡Te faltan <strong>$${remaining}</strong> para una Kushiague GRATIS!`;
    progressText.classList.remove('text-green-700');
  }
}

// ============================================
// 8. MODAL DE PREFERENCIAS
// ============================================

/**
 * Abre o cierra el modal de preferencias
 */
function toggleModal() {
  const modal = document.getElementById('preferences-modal');
  if (!modal) return;
  
  const isHidden = modal.classList.contains('hidden');
  
  if (isHidden) {
    // Abrir modal
    renderCartItems();
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden'; // Prevenir scroll
  } else {
    // Cerrar modal
    modal.classList.add('hidden');
    document.body.style.overflow = ''; // Restaurar scroll
  }
}

/**
 * Renderiza los items del carrito en el modal
 */
function renderCartItems() {
  const list = document.getElementById('cart-list');
  if (!list) return;
  
  list.innerHTML = '';
  
  if (AppState.cart.length === 0) {
    list.innerHTML = '<li class="text-gray-500 text-center py-4">Tu carrito está vacío</li>';
    updateModalTotals();
    return;
  }
  
  AppState.cart.forEach((item, index) => {
    const li = document.createElement('li');
    li.className = 'cart-item';
    li.innerHTML = `
      <span class="cart-item-name" title="${item.name}">${item.name}</span>
      <div class="flex items-center gap-2">
        <span class="cart-item-price">$${item.price}</span>
        <button onclick="removeFromCart(${index})" class="cart-item-remove" aria-label="Eliminar ${item.name}">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `;
    list.appendChild(li);
  });
  
  updateModalTotals();
}

/**
 * Actualiza los totales mostrados en el modal
 */
function updateModalTotals() {
  const { subtotal, discount: dailyDiscount } = calculateCart();
  
  // Calcular costo de extras
  let extrasCost = 0;
  document.querySelectorAll('input[name="extra_item"]:checked').forEach(checkbox => {
    extrasCost += parseInt(checkbox.dataset.price || 0);
  });
  
  // Calcular descuento de cupón
  const couponDiscount = dailyDiscount === 0 ? calculateCouponDiscount(subtotal) : 0;
  
  // Total final
  const finalTotal = subtotal + extrasCost - dailyDiscount - couponDiscount;
  
  // Actualizar DOM
  const subtotalEl = document.getElementById('modal-subtotal');
  const discountRow = document.getElementById('modal-discount-row');
  const discountEl = document.getElementById('modal-discount');
  const couponRow = document.getElementById('modal-coupon-row');
  const couponDiscountEl = document.getElementById('modal-coupon-discount');
  const totalEl = document.getElementById('modal-total');
  
  if (subtotalEl) subtotalEl.innerText = `$${subtotal + extrasCost}`;
  if (totalEl) totalEl.innerText = `$${finalTotal}`;
  
  // Mostrar/ocultar fila de descuento diario
  if (discountRow && discountEl) {
    if (dailyDiscount !== 0) {
      discountRow.classList.remove('hidden');
      discountEl.innerText = `-$${dailyDiscount}`;
      if (couponRow) couponRow.classList.add('hidden');
    } else {
      discountRow.classList.add('hidden');
    }
  }
  
  // Mostrar/ocultar fila de cupón
  if (couponRow && couponDiscountEl) {
    if (couponDiscount > 0 && dailyDiscount === 0) {
      couponRow.classList.remove('hidden');
      couponDiscountEl.innerText = `-$${couponDiscount}`;
    } else {
      couponRow.classList.add('hidden');
    }
  }
  
  // Actualizar barra de progreso
  updateProgressBar(subtotal + extrasCost);
}

// ============================================
// 9. MODAL DE SELECCIÓN DE PROTEÍNAS
// ============================================

/**
 * Abre el modal de selección de proteínas
 * @param {string} baseName - Nombre base del producto
 * @param {number} price - Precio del producto
 * @param {number} limit - Límite de proteínas a seleccionar
 * @param {string} category - Categoría del producto
 */
function openProteinSelection(baseName, price, limit, category) {
  AppState.currentProteinRequest = { baseName, price, limit, category };
  
  // Actualizar títulos del modal
  const titleEl = document.getElementById('protein-modal-title');
  const subtitleEl = document.getElementById('protein-modal-subtitle');
  
  if (titleEl) titleEl.innerText = baseName;
  if (subtitleEl) {
    subtitleEl.innerHTML = `Selecciona exactamente <strong class="text-red-600">${limit}</strong> proteínas`;
  }
  
  // Resetear checkboxes
  document.querySelectorAll('.protein-checkbox').forEach(cb => {
    cb.checked = false;
    cb.disabled = false;
    const parent = cb.closest('.protein-option');
    if (parent) parent.classList.remove('opacity-50');
  });
  
  validateProteinSelection();
  
  // Mostrar modal
  const modal = document.getElementById('protein-modal');
  if (modal) {
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }
}

/**
 * Cierra el modal de proteínas
 */
function closeProteinModal() {
  const modal = document.getElementById('protein-modal');
  if (modal) {
    modal.classList.add('hidden');
    document.body.style.overflow = '';
  }
  AppState.currentProteinRequest = null;
}

/**
 * Valida la selección de proteínas
 * Habilita/deshabilita opciones según el límite
 */
function validateProteinSelection() {
  if (!AppState.currentProteinRequest) return;
  
  const limit = AppState.currentProteinRequest.limit;
  const checkedBoxes = document.querySelectorAll('.protein-checkbox:checked');
  const confirmBtn = document.getElementById('confirm-proteins-btn');
  const allBoxes = document.querySelectorAll('.protein-checkbox');
  
  // Deshabilitar opciones no seleccionadas si se alcanzó el límite
  if (checkedBoxes.length >= limit) {
    allBoxes.forEach(cb => {
      if (!cb.checked) {
        cb.disabled = true;
        const parent = cb.closest('.protein-option');
        if (parent) parent.classList.add('opacity-50');
      }
    });
  } else {
    allBoxes.forEach(cb => {
      cb.disabled = false;
      const parent = cb.closest('.protein-option');
      if (parent) parent.classList.remove('opacity-50');
    });
  }
  
  // Habilitar botón confirmar solo si se cumple el número exacto
  if (confirmBtn) {
    if (checkedBoxes.length === limit) {
      confirmBtn.disabled = false;
      confirmBtn.classList.remove('bg-gray-300', 'cursor-not-allowed');
      confirmBtn.classList.add('bg-red-600', 'hover:bg-red-700');
    } else {
      confirmBtn.disabled = true;
      confirmBtn.classList.add('bg-gray-300', 'cursor-not-allowed');
      confirmBtn.classList.remove('bg-red-600', 'hover:bg-red-700');
    }
  }
}

/**
 * Confirma la selección de proteínas y agrega al carrito
 */
function confirmProteinSelection() {
  if (!AppState.currentProteinRequest) return;
  
  const checkedBoxes = document.querySelectorAll('.protein-checkbox:checked');
  const selectedProteins = Array.from(checkedBoxes).map(cb => cb.value);
  
  const fullName = `${AppState.currentProteinRequest.baseName} (${selectedProteins.join(', ')})`;
  
  addToCart(
    fullName,
    AppState.currentProteinRequest.price,
    AppState.currentProteinRequest.category
  );
  
  closeProteinModal();
}

// ============================================
// 10. INTEGRACIÓN CON WHATSAPP
// ============================================

/**
 * Abre el modal de preferencias o WhatsApp directo si el carrito está vacío
 */
function sendOrder() {
  if (AppState.cart.length === 0) {
    window.open(AppState.config.social.whatsappDirect, '_blank');
    return;
  }
  
  renderCartItems();
  const modal = document.getElementById('preferences-modal');
  if (modal) {
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }
}

/**
 * Envía el pedido formateado a WhatsApp
 * Recolecta todas las preferencias y construye el mensaje
 */
function submitOrderWithPreferences() {
  // Recolectar cubiertos seleccionados
  const cutlerySelected = [];
  document.querySelectorAll('input[name="cutlery"]:checked').forEach(checkbox => {
    cutlerySelected.push(checkbox.value);
  });
  const cutleryString = cutlerySelected.length > 0 ? cutlerySelected.join(', ') : 'Ninguno';
  
  // Recolectar preferencia de soya
  const soySauceElement = document.querySelector('input[name="soy_sauce"]:checked');
  const soySauce = soySauceElement ? soySauceElement.value : 'Sin Chile (Preparada)';
  
  // Recolectar dirección y notas
  const addressEl = document.getElementById('delivery-address');
  const notesEl = document.getElementById('order-notes');
  const address = addressEl ? addressEl.value.trim() : '';
  const notes = notesEl ? notesEl.value.trim() : '';
  
  // Recolectar extras
  const extraItems = [];
  let totalExtrasCost = 0;
  document.querySelectorAll('input[name="extra_item"]:checked').forEach(checkbox => {
    const price = parseInt(checkbox.dataset.price || 0);
    extraItems.push(`${checkbox.value} ($${price})`);
    totalExtrasCost += price;
  });
  
  // Calcular totales
  const { subtotal, discount: dailyDiscount } = calculateCart();
  const couponDiscount = dailyDiscount === 0 ? calculateCouponDiscount(subtotal) : 0;
  const currentTotalCalc = subtotal + totalExtrasCost;
  const finalTotal = currentTotalCalc - dailyDiscount - couponDiscount;
  
  // Construir mensaje
  let message = 'Hola Wokami! 🍱 Quiero ordenar:%0A';
  
  // Lista de productos
  AppState.cart.forEach(item => {
    message += `- ${item.name} ($${item.price})%0A`;
  });
  
  // Extras
  if (extraItems.length > 0) {
    message += `%0A--- Extras ($${totalExtrasCost}) ---%0A`;
    extraItems.forEach(itemStr => {
      message += `+ ${itemStr}%0A`;
    });
  }
  
  // Premio desbloqueado
  if (currentTotalCalc >= CONSTANTS.KUSHIAGUE_GOAL) {
    message += `%0A🎁 ¡PREMIO DESBLOQUEADO! Kushiague GRATIS 🍡%0A`;
  }
  
  // Totales
  if (dailyDiscount !== 0) {
    message += `%0ASubtotal: $${currentTotalCalc}`;
    message += `%0AAjuste Promoción: -$${dailyDiscount}`;
  } else if (couponDiscount > 0) {
    message += `%0ASubtotal: $${currentTotalCalc}`;
    message += `%0ADescuento Cupón (${AppState.appliedCoupon}): -$${couponDiscount}`;
  }
  
  message += `%0ATotal Final: $${finalTotal}`;
  
  // Preferencias
  message += `%0A%0A--- Preferencias ---%0A`;
  message += `🥢 Cubiertos: ${cutleryString}%0A`;
  message += `🍶 Soya: ${soySauce}`;
  
  // Dirección y notas
  if (address) {
    message += `%0A📍 Dirección: ${encodeURIComponent(address)}`;
  }
  if (notes) {
    message += `%0A📝 Notas: ${encodeURIComponent(notes)}`;
  }
  
  message += '%0A%0A(Envía este mensaje para confirmar tu pedido)';
  
  // Abrir WhatsApp
  window.open(`https://wa.me/${CONSTANTS.PHONE_NUMBER}?text=${message}`, '_blank');
  
  // Cerrar modal
  toggleModal();
}

/**
 * Abre WhatsApp directo (para el footer)
 */
function sendOrderGeneric() {
  window.open(AppState.config.social.whatsappDirect, '_blank');
}

// ============================================
// 11. RENDERIZADO DINÁMICO DEL MENÚ
// ============================================

/**
 * Renderiza todos los productos del menú dinámicamente
 * Esta función puede llamarse al cargar la página
 */
function renderMenu() {
  renderEntradas();
  renderRollosClasicos();
  renderRollosEspeciales();
  renderWokSection();
  renderPostres();
  renderBebidas();
}

/**
 * Renderiza la sección de entradas
 */
function renderEntradas() {
  const container = document.getElementById('entradas-container');
  if (!container) return;
  
  const entradas = MENU_DATA.entradas;
  container.innerHTML = entradas.map(item => createEntradaCard(item)).join('');
}

/**
 * Crea el HTML de una tarjeta de entrada
 */
function createEntradaCard(item) {
  const badges = item.badges ? item.badges.map(badge => {
    if (badge === 'hot') return '<span class="text-[10px] font-bold text-white bg-red-600 px-2 py-0.5 rounded shadow-sm">Hot</span>';
    return '';
  }).join('') : '';
  
  const selectOptions = item.selectOptions ? item.selectOptions.map(opt => 
    `<option value="${opt.value}">${opt.label}</option>`
  ).join('') : '';
  
  return `
    <div class="menu-item-card bg-white rounded-lg shadow-sm overflow-hidden flex flex-col sm:flex-row min-h-32 group">
      <div class="w-full sm:w-40 h-40 sm:h-auto flex-shrink-0 bg-gray-200 relative overflow-hidden card-image-container">
        <img src="./assets/img/${item.image}" 
             onerror="this.src='https://via.placeholder.com/300?text=${encodeURIComponent(item.name)}'"
             alt="${item.name}"
             class="w-full h-full object-cover object-center absolute inset-0"
             loading="lazy">
      </div>
      <div class="p-4 flex-grow flex flex-col justify-between">
        <div>
          <div class="flex items-baseline gap-2">
            <h3 class="text-lg md:text-xl font-bold text-gray-900 leading-tight">${item.name}</h3>
            ${badges}
          </div>
          <p class="text-gray-600 text-xs md:text-sm mt-1 mb-2">${item.description}</p>
          <select id="${item.selectId}" class="form-select text-sm">
            ${selectOptions}
          </select>
        </div>
        <div class="flex justify-between items-center mt-3">
          <span class="text-lg font-bold text-gray-800">$${item.price}</span>
          <button onclick="addKushiageFromSelect()" class="btn-primary text-xs py-2 px-4">
            <i class="fas fa-plus mr-1"></i> Agregar
          </button>
        </div>
      </div>
    </div>
  `;
}

/**
 * Renderiza los rollos clásicos
 */
function renderRollosClasicos() {
  const container = document.getElementById('rollos-clasicos-container');
  if (!container) return;
  
  const rollos = MENU_DATA.rollosClasicos;
  container.innerHTML = rollos.map(item => createRolloCard(item)).join('');
}

/**
 * Renderiza los rollos especiales
 */
function renderRollosEspeciales() {
  const container = document.getElementById('rollos-especiales-container');
  if (!container) return;
  
  const rollos = MENU_DATA.rollosEspeciales;
  container.innerHTML = rollos.map(item => createRolloCard(item)).join('');
}

/**
 * Crea el HTML de una tarjeta de rollo
 */
function createRolloCard(item) {
  let badgeHTML = '';
  if (item.badges) {
    if (item.badges.includes('best-seller')) {
      badgeHTML = `<div class="card-badge card-badge--best-seller">Best Seller</div>`;
    } else if (item.badges.includes('premium')) {
      badgeHTML = `<div class="card-badge card-badge--premium">Premium</div>`;
    }
  }
  
  const optionsHTML = item.hasOptions !== false ? `
    <div class="flex gap-2 mt-4">
      <button onclick="addToCart('${item.name} (Natural)', ${item.price}, 'rollo')" 
              class="btn-option btn-option-natural flex-1">Natural</button>
      <button onclick="addToCart('${item.name} (Empanizado)', ${item.price}, 'rollo')" 
              class="btn-option btn-option-empanizado flex-1">Empanizado</button>
    </div>
  ` : `
    <button onclick="addToCart('${item.name}', ${item.price}, 'rollo')" 
            class="btn-primary mt-4 w-full md:w-auto">Ordenar</button>
  `;
  
  return `
    <div class="menu-item-card bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 flex flex-col md:flex-row h-full relative">
      ${badgeHTML}
      <div class="w-full md:w-1/3 h-48 md:h-auto bg-gray-200 relative card-image-container">
        <img src="./assets/img/${item.image}" 
             onerror="this.src='https://via.placeholder.com/400x300?text=${encodeURIComponent(item.name)}'"
             alt="${item.name}"
             class="w-full h-full object-cover object-center"
             loading="lazy">
      </div>
      <div class="p-6 md:w-2/3 flex flex-col justify-between">
        <div>
          <div class="flex justify-between items-start mb-2">
            <h3 class="text-xl font-bold text-black brand-font">${item.name}</h3>
            <span class="text-red-600 font-bold text-lg">$${item.price}</span>
          </div>
          <p class="text-gray-600 text-sm mb-2">
            <strong>Por dentro:</strong> ${item.description.inside}<br>
            <strong>Por fuera:</strong> ${item.description.outside}
          </p>
        </div>
        ${optionsHTML}
      </div>
    </div>
  `;
}

/**
 * Renderiza la sección de Wok
 */
function renderWokSection() {
  renderWokCard('yakimeshi-container', MENU_DATA.yakimeshi);
  renderWokCard('lomein-container', MENU_DATA.loMein);
}

/**
 * Renderiza una tarjeta de Wok (Yakimeshi o Lo Mein)
 */
function renderWokCard(containerId, data) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  const badgeHTML = data.badge ? `
    <span class="absolute top-0 right-0 bg-yellow-400 text-black text-[10px] font-bold px-3 py-1 rounded-bl-lg z-10 shadow-sm">
      ⭐ ${data.badge}
    </span>
  ` : '';
  
  const noteHTML = data.note ? `
    <span class="inline-block mt-2 bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full border border-red-200 font-bold not-italic">
      <i class="fas fa-exclamation-circle mr-1"></i>${data.note}
    </span>
  ` : '';
  
  const variantsHTML = data.variants.map(variant => {
    const iconColors = {
      'green': 'text-green-600',
      'orange': 'text-orange-400',
      'red': 'text-red-400',
      'red-dark': 'text-red-800',
      'gray': 'text-gray-500',
      'yellow': 'text-yellow-600'
    };
    
    const bgClass = variant.isSpecial ? 'bg-red-50 text-red-900 border border-red-100 font-bold' : 
                    variant.hasProteinSelection ? 'bg-gray-50 font-medium' : 'hover:bg-gray-50';
    
    const buttonAction = variant.hasProteinSelection 
      ? `openProteinSelection('${variant.name}', ${variant.price}, ${variant.proteinLimit}, 'wok')`
      : `addToCart('${data.name} ${variant.name}', ${variant.price}, 'wok')`;
    
    const buttonClass = variant.isSpecial 
      ? 'text-red-600 hover:text-red-800' 
      : 'text-gray-400 hover:text-red-600';
    
    return `
      <li class="flex justify-between items-center text-sm text-gray-700 ${bgClass} p-2 rounded transition-colors">
        <span><i class="fas fa-${variant.icon} ${iconColors[variant.iconColor]} mr-2"></i>${variant.name}</span>
        <div class="flex items-center gap-2">
          <span class="font-bold">$${variant.price}</span>
          <button onclick="${buttonAction}" class="${buttonClass} p-2" aria-label="Agregar ${variant.name}">
            <i class="fas fa-plus-circle fa-lg"></i>
          </button>
        </div>
      </li>
    `;
  }).join('');
  
  container.innerHTML = `
    <div class="bg-white border-t-4 border-red-600 shadow-md rounded-b-lg h-full overflow-hidden hover:shadow-xl transition-shadow menu-item-card relative">
      ${badgeHTML}
      <div class="h-48 w-full bg-gray-200 relative overflow-hidden card-image-container">
        <img src="./assets/img/${data.image}" 
             onerror="this.src='https://via.placeholder.com/600x200?text=${encodeURIComponent(data.name)}'"
             alt="${data.name}"
             class="w-full h-full object-cover object-center"
             loading="lazy">
      </div>
      <div class="p-6 md:p-8">
        <div class="flex justify-between items-center mb-4 border-b border-gray-100 pb-2">
          <h3 class="text-2xl font-bold uppercase tracking-wide brand-font">${data.name}</h3>
          <span class="text-4xl text-gray-300 font-bold" style="font-family: 'Noto Sans JP', sans-serif;">${data.japanese}</span>
        </div>
        <p class="text-gray-600 italic mb-4">${data.description}</p>
        ${noteHTML}
        <ul class="space-y-2 mt-4">
          ${variantsHTML}
        </ul>
      </div>
    </div>
  `;
}

/**
 * Renderiza la sección de postres
 */
function renderPostres() {
  const container = document.getElementById('postres-container');
  if (!container) return;
  
  const postres = MENU_DATA.postres;
  container.innerHTML = postres.map(item => createPostreCard(item)).join('');
}

/**
 * Crea el HTML de una tarjeta de postre
 */
function createPostreCard(item) {
  const selectHTML = item.hasSelect ? `
    <select id="${item.selectId}" class="form-select text-sm mt-2">
      ${item.selectOptions.map(opt => `<option value="${opt.value}">${opt.label}</option>`).join('')}
    </select>
  ` : '';
  
  const buttonAction = item.hasSelect 
    ? item.id === 'galletas-new-york' ? 'addCookieFromSelect()' 
    : item.id === 'mochis' ? 'addMochiFromSelect()' 
    : ''
    : `addToCart('${item.name}${item.flavorOfTheWeek ? ` (${item.flavorOfTheWeek})` : ''}', ${item.price}, 'postre')`;
  
  const flavorHTML = item.flavorOfTheWeek ? `
    <p class="text-xs text-red-600 font-bold mt-1">
      <i class="fas fa-star mr-1"></i>Sabor de la semana: ${item.flavorOfTheWeek}
    </p>
  ` : '';
  
  return `
    <div class="menu-item-card bg-white rounded-lg shadow-sm overflow-hidden flex flex-col sm:flex-row min-h-32 group border border-gray-100">
      <div class="w-full sm:w-40 h-40 sm:h-auto flex-shrink-0 bg-gray-200 relative overflow-hidden card-image-container">
        <img src="./assets/img/${item.image}" 
             onerror="this.src='https://via.placeholder.com/300x300?text=${encodeURIComponent(item.name)}'"
             alt="${item.name}"
             class="w-full h-full object-cover object-center absolute inset-0"
             loading="lazy">
      </div>
      <div class="p-4 flex-grow flex flex-col justify-between">
        <div>
          <h3 class="text-lg md:text-xl font-bold text-gray-900">${item.name}</h3>
          <p class="text-gray-600 text-xs md:text-sm mt-1">${item.description}</p>
          ${flavorHTML}
          ${selectHTML}
        </div>
        <div class="flex justify-between items-center mt-3">
          <span class="text-lg font-bold text-gray-900">$${item.price}</span>
          <button onclick="${buttonAction}" class="btn-primary text-xs py-2 px-3 rounded-full">
            <i class="fas fa-plus text-sm"></i>
          </button>
        </div>
      </div>
    </div>
  `;
}

/**
 * Renderiza la sección de bebidas
 */
function renderBebidas() {
  const container = document.getElementById('bebidas-container');
  if (!container) return;
  
  const bebidas = MENU_DATA.bebidas;
  container.innerHTML = bebidas.map(item => `
    <div class="menu-item-card bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden flex flex-col sm:flex-row min-h-32 group">
      <div class="w-full sm:w-40 h-40 sm:h-auto flex-shrink-0 bg-gray-200 relative overflow-hidden card-image-container">
        <img src="./assets/img/${item.image}" 
             onerror="this.src='https://via.placeholder.com/300x300?text=${encodeURIComponent(item.name)}'"
             alt="${item.name}"
             class="w-full h-full object-cover object-center absolute inset-0"
             loading="lazy">
      </div>
      <div class="p-4 flex-grow flex justify-between items-center">
        <div>
          <h3 class="text-lg md:text-xl font-bold text-gray-900">${item.name}</h3>
          <p class="text-gray-600 text-sm mt-1">${item.description}</p>
        </div>
        <div class="flex flex-col items-end">
          <span class="text-lg font-bold text-gray-900 mb-1">$${item.price}</span>
          <button onclick="addToCart('${item.name}', ${item.price}, 'bebida')" class="btn-primary text-xs py-2 px-3 rounded-full">
            <i class="fas fa-plus text-sm"></i>
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

// ============================================
// 12. UTILIDADES Y HELPERS
// ============================================

/**
 * Muestra un toast notification
 * @param {string} message - Mensaje a mostrar
 * @param {number} duration - Duración en ms (default: 3000)
 */
function showToast(message, duration = 3000) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  
  toast.innerText = message;
  toast.classList.add('show');
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, duration);
}

/**
 * Actualiza el texto del botón flotante del carrito
 */
function updateCartButton() {
  const btnText = document.getElementById('cart-text');
  if (!btnText) return;
  
  const { total } = calculateCart();
  const count = AppState.cart.length;
  
  if (count > 0) {
    btnText.innerText = `Ver Pedido (${count}) - $${total}`;
    btnText.classList.remove('hidden');
  } else {
    btnText.innerText = 'Pedir Ahora';
  }
}

/**
 * Inicializa el scroll suave para los enlaces de anclaje
 */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth' });
      }
      
      // Cerrar menú móvil si está abierto
      const mobileMenu = document.getElementById('mobile-menu');
      if (mobileMenu) {
        mobileMenu.classList.add('hidden');
      }
    });
  });
}

/**
 * Toggle del menú móvil
 */
function toggleMobileMenu() {
  const mobileMenu = document.getElementById('mobile-menu');
  if (mobileMenu) {
    mobileMenu.classList.toggle('hidden');
  }
}

// ============================================
// 13. INICIALIZACIÓN
// ============================================

/**
 * Inicializa la aplicación
 * Se ejecuta cuando el DOM está listo
 */
function initApp() {
  // Actualizar contenido dinámico
  updateStatusBadge();
  updateDailyPromo();
  
  // Inicializar scroll suave
  initSmoothScroll();
  
  // Actualizar botón del carrito
  updateCartButton();
  
  // Renderizar menú dinámicamente (opcional, si se quiere cargar desde JS)
  // renderMenu();
  
  // Configurar eventos globales
  setupGlobalEvents();
  
  console.log('🍣 Wokami App inicializada correctamente');
}

/**
 * Configura eventos globales
 */
function setupGlobalEvents() {
  // Cerrar modales al hacer clic fuera
  document.addEventListener('click', function(e) {
    const preferencesModal = document.getElementById('preferences-modal');
    const proteinModal = document.getElementById('protein-modal');
    
    if (e.target === preferencesModal) {
      toggleModal();
    }
    if (e.target === proteinModal) {
      closeProteinModal();
    }
  });
  
  // Tecla Escape para cerrar modales
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      const preferencesModal = document.getElementById('preferences-modal');
      const proteinModal = document.getElementById('protein-modal');
      
      if (preferencesModal && !preferencesModal.classList.contains('hidden')) {
        toggleModal();
      }
      if (proteinModal && !proteinModal.classList.contains('hidden')) {
        closeProteinModal();
      }
    }
  });
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', initApp);

// Exportar funciones para testing (si se usa en módulos)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    addToCart,
    removeFromCart,
    calculateCart,
    applyCoupon,
    updateProgressBar,
    AppState,
    CONSTANTS
  };
}
