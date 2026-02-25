/**
 * WOKAMI - Datos del Menú
 * =======================
 * Este archivo contiene todos los productos del menú organizados por categorías.
 * Facilita la actualización de precios, descripciones y la posible carga dinámica.
 * 
 * Estructura de cada producto:
 * - id: Identificador único
 * - name: Nombre del producto
 * - price: Precio en pesos mexicanos
 * - description: Descripción detallada
 * - image: Nombre del archivo de imagen (debe estar en assets/img/)
 * - category: Categoría para filtros y promociones
 * - options: Opciones adicionales (empanizado/natural, selección de proteínas, etc.)
 * - badges: Etiquetas especiales (Hot, Best Seller, Premium)
 */

const MENU_DATA = {
  // ============================================
  // ENTRADAS
  // ============================================
  entradas: [
    {
      id: 'kushiagues',
      name: 'Kushiagues',
      price: 65,
      description: '3 pzs. Ideales para compartir. Elige tu relleno:',
      image: 'kushiagues.jpg',
      category: 'entrada',
      badges: ['hot'],
      hasSelect: true,
      selectId: 'kushiage-select',
      selectOptions: [
        { value: 'Queso Philadelphia', label: 'Queso Philadelphia' },
        { value: 'Queso Manchego', label: 'Queso Manchego' },
        { value: 'Camarón con Philadelphia', label: 'Camarón c/ Philadelphia' },
        { value: 'Camarón con Manchego', label: 'Camarón c/ Manchego' },
        { value: 'Plátano Macho con Philadelphia', label: 'Plátano c/ Philadelphia' }
      ]
    }
  ],

  // ============================================
  // ROLLOS CLÁSICOS
  // ============================================
  rollosClasicos: [
    {
      id: 'america-roll',
      name: 'America Roll',
      price: 120,
      description: {
        inside: 'Camarones empanizados, aguacate y queso crema.',
        outside: 'Mango con chile tajín, ajonjolí y salsa de anguila.'
      },
      image: 'america.jpg',
      category: 'rollo',
      hasOptions: false // No permite empanizado/natural
    },
    {
      id: 'banana-roll',
      name: 'Banana Roll',
      price: 120,
      description: {
        inside: 'Queso crema, aguacate y camarón.',
        outside: 'Plátano macho frito, ajonjolí y salsa de anguila.'
      },
      image: 'banana.jpg',
      category: 'rollo',
      hasOptions: true
    },
    {
      id: 'cheese-roll',
      name: 'Cheese Roll',
      price: 120,
      description: {
        inside: 'Tiras de pollo empanizado, queso crema y aguacate.',
        outside: 'Cubierto de queso gratinado spicy, salsa de anguila y ajonjolí.'
      },
      image: 'cheese.jpg',
      category: 'rollo',
      hasOptions: true,
      badges: ['best-seller']
    },
    {
      id: 'california-roll',
      name: 'California Roll',
      price: 120,
      description: {
        inside: 'Camarón, queso crema, aguacate y pepino.',
        outside: 'Tampico.'
      },
      image: 'california.jpg',
      category: 'rollo',
      hasOptions: true
    },
    {
      id: 'nortenito-roll',
      name: 'Norteñito Roll',
      price: 120,
      description: {
        inside: 'Res sazonada, queso manchego, aguacate y chiles toreados.',
        outside: 'Aderezo de chipotle y salsa de anguila.'
      },
      image: 'nortenito.jpg',
      category: 'rollo',
      hasOptions: true
    }
  ],

  // ============================================
  // ROLLOS ESPECIALES (Premium)
  // ============================================
  rollosEspeciales: [
    {
      id: 'diabla-roll',
      name: 'A la Diabla Roll',
      price: 150,
      description: {
        inside: 'Queso crema, aguacate y pepino.',
        outside: 'Trocitos de camarón en salsa a la diabla.'
      },
      image: 'diabla.jpg',
      category: 'rollo',
      hasOptions: true,
      badges: ['premium']
    },
    {
      id: 'grinch-roll',
      name: 'Grinch Roll',
      price: 150,
      description: {
        inside: 'Queso crema, tampico y camarones empanizados.',
        outside: 'Aguacate y mezcla de ajonjolí con tampico.'
      },
      image: 'grinch.jpg',
      category: 'rollo',
      hasOptions: false
    },
    {
      id: 'aguachile-roll',
      name: 'Aguachile Roll',
      price: 150,
      description: {
        inside: 'Pepino, queso crema y aguacate.',
        outside: 'Aguachile de camarón con mango fresco.'
      },
      image: 'aguachile.jpg',
      category: 'rollo',
      hasOptions: true,
      badges: ['premium']
    }
  ],

  // ============================================
  // WOK & BOWLS - YAKIMESHI
  // ============================================
  yakimeshi: {
    id: 'yakimeshi',
    name: 'Yakimeshi',
    japanese: '飯',
    description: 'Arroz frito salteado al wok con calabaza y zanahoria.',
    image: 'yakimeshi.jpg',
    variants: [
      { id: 'yakimeshi-verduras', name: 'Verduras (Base)', price: 70, icon: 'leaf', iconColor: 'green' },
      { id: 'yakimeshi-pollo', name: 'Con Pollo', price: 100, icon: 'drumstick-bite', iconColor: 'orange' },
      { id: 'yakimeshi-camaron', name: 'Con Camarón', price: 120, icon: 'shrimp', iconColor: 'red' },
      { id: 'yakimeshi-res', name: 'Con Res', price: 120, icon: 'bacon', iconColor: 'red-dark' },
      { 
        id: 'yakimeshi-mixto', 
        name: 'Mixto (2 proteínas)', 
        price: 130, 
        icon: 'utensils', 
        iconColor: 'gray',
        hasProteinSelection: true,
        proteinLimit: 2
      },
      { 
        id: 'yakimeshi-especial', 
        name: 'Especial (3 proteínas + Kushiagues)', 
        price: 150, 
        icon: 'star', 
        iconColor: 'yellow',
        isSpecial: true,
        fixedProteins: ['Pollo', 'Res', 'Camarón']
      }
    ]
  },

  // ============================================
  // WOK & BOWLS - LO MEIN
  // ============================================
  loMein: {
    id: 'lo-mein',
    name: 'Lo Mein',
    japanese: '麵',
    description: 'Pasta salteada con zanahoria, cebolla, brócoli, champiñones y col morada, bañada en salsa a base de soya, acompañada de pesto de cilantro.',
    note: 'Nota: No incluye soya',
    image: 'lomein.jpg',
    badge: 'La joya oculta de Wokami',
    variants: [
      { id: 'lomein-vegetariano', name: 'Vegetariano', price: 65, icon: 'leaf', iconColor: 'green' },
      { id: 'lomein-pollo', name: 'Con Pollo', price: 80, icon: 'drumstick-bite', iconColor: 'orange' },
      { id: 'lomein-res', name: 'Con Res', price: 80, icon: 'bacon', iconColor: 'red-dark' },
      { id: 'lomein-camaron', name: 'Con Camarón', price: 95, icon: 'shrimp', iconColor: 'red' },
      { 
        id: 'lomein-mixto', 
        name: 'Mixto (2 proteínas)', 
        price: 95, 
        icon: 'utensils', 
        iconColor: 'gray',
        hasProteinSelection: true,
        proteinLimit: 2
      },
      { 
        id: 'lomein-especial', 
        name: 'Especial (3 proteínas)', 
        price: 120, 
        icon: 'star', 
        iconColor: 'yellow',
        isSpecial: true,
        fixedProteins: ['Pollo', 'Res', 'Camarón']
      }
    ]
  },

  // ============================================
  // POSTRES
  // ============================================
  postres: [
    {
      id: 'galletas-new-york',
      name: 'Galletas New York',
      price: 45,
      description: 'Estilo New York. Elige tu sabor:',
      image: 'galletas.jpg',
      category: 'postre',
      hasSelect: true,
      selectId: 'cookie-select',
      selectOptions: [
        { value: 'Red Velvet rellena de queso', label: 'Red Velvet rellena de queso' },
        { value: 'Pay de Limón Eureka rellena de queso', label: 'Pay de Limón Eureka rellena de queso' }
      ]
    },
    {
      id: 'tempura-helado',
      name: 'Tempura Helado',
      price: 75,
      description: 'Helado frito en tempura crujiente con chocolate.',
      image: 'helado.jpg',
      category: 'postre',
      flavorOfTheWeek: 'Nieve de Cajeta'
    },
    {
      id: 'mochis',
      name: 'Mochis',
      price: 55,
      description: 'Pastelillo de arroz. Elige tu relleno:',
      image: 'mochis.jpg',
      category: 'postre',
      hasSelect: true,
      selectId: 'mochi-select',
      selectOptions: [
        { value: 'Nieve de Chongos', label: 'Nieve de Chongos' },
        { value: 'Nieve de Zarzamora', label: 'Nieve de Zarzamora' }
      ]
    }
  ],

  // ============================================
  // BEBIDAS
  // ============================================
  bebidas: [
    {
      id: 'agua-fresca',
      name: 'Aguas Frescas',
      price: 35,
      description: '1lt. Deliciosos sabores naturales del día.',
      image: 'aguas.jpg',
      category: 'bebida'
    },
    {
      id: 'refresco',
      name: 'Refrescos',
      price: 30,
      description: '600ml. Familia Coca-Cola.',
      image: 'refrescos.jpg',
      category: 'bebida'
    }
  ],

  // ============================================
  // EXTRAS DISPONIBLES
  // ============================================
  extras: [
    { id: 'soya-extra', name: 'Soya Extra', price: 10, highlight: true },
    { id: 'salsa-anguila', name: 'Salsa de Anguila', price: 15 },
    { id: 'aderezo-chipotle', name: 'Aderezo Chipotle', price: 15 },
    { id: 'sriracha', name: 'Sriracha', price: 15 },
    { id: 'pesto-cilantro', name: 'Pesto de Cilantro', price: 15 },
    { id: 'extra-philadelphia', name: 'Extra Queso Philadelphia', price: 20, highlight: true },
    { id: 'extra-manchego', name: 'Extra Queso Manchego', price: 20, highlight: true },
    { id: 'tampico', name: 'Tampico', price: 25, highlight: true }
  ],

  // ============================================
  // OPCIONES DE PROTEÍNAS
  // ============================================
  proteinas: [
    { value: 'Pollo', icon: 'drumstick-bite', iconColor: 'orange' },
    { value: 'Res', icon: 'bacon', iconColor: 'red-dark' },
    { value: 'Camarón', icon: 'shrimp', iconColor: 'red' }
  ],

  // ============================================
  // CONFIGURACIÓN DE LA TIENDA
  // ============================================
  config: {
    // Horario de operación
    hours: {
      open: 14,    // 2:00 PM
      close: 20,   // 8:00 PM
      openDays: [0, 3, 4, 5, 6] // Domingo, Miércoles, Jueves, Viernes, Sábado
    },
    
    // Meta para Kushiague gratis
    kushiagueGoal: 350,
    
    // Número de WhatsApp para pedidos
    phoneNumber: '5214433580280',
    
    // Enlaces a redes sociales
    social: {
      facebook: 'https://www.facebook.com/share/1DLwFajUXz/',
      instagram: 'https://www.instagram.com/wokami_sushi?igsh=NWYzYW82dG81eWdm',
      whatsappDirect: 'https://wa.me/message/P4FK7RF2G2RWH1'
    },
    
    // Cupones disponibles
    cupones: {
      WOK5: { discount: 0.05, description: '5% de descuento' },
      PREPA10: { 
        discount: 0.10, 
        description: '10% de descuento',
        validDays: [3, 4, 5], // Miércoles a Viernes
        autoAddress: 'Escuela Preparatoria Regional De La Barca UDEG'
      },
      FAMILIA: { 
        discount: 0.10, 
        description: '10% de descuento',
        validDays: [0] // Solo domingos
      }
    }
  }
};

// Exportar para uso en módulos (si se usa ES6)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MENU_DATA;
}
