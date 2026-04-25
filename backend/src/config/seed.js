/**
 * ConectaTEA — Seed de Base de Datos
 * Pobla todas las tablas con datos de ejemplo realistas
 * Uso: node src/config/seed.js
 */
require('dotenv').config();
const { sequelize } = require('./database');
const bcrypt = require('bcryptjs');

// Importar todos los modelos
require('../models'); // activa las asociaciones
const {
  Usuario, Nino, Relacion,
  Area, Actividad, Progreso,
  Emocion, RegistroEmo,
  Rutina, PasoRutina,
  Pictograma, Tablero,
  Material, Informe,
  BlogPost, ChatMensaje,
  RedApoyo,
  Logro, LogroUsuario,
  Notificacion,
  Video, VideoVisto,
} = require('../models');

const ROUNDS = 10;
const hash   = (p) => bcrypt.hash(p, ROUNDS);

async function seed() {
  console.log('🌱 Iniciando seed de ConectaTEA...\n');
  await sequelize.sync({ force: true }); // ⚠️ Borra y recrea todo
  console.log('✅ Tablas recreadas\n');

  // ════════════════════════════════════════
  //  1. USUARIOS
  // ════════════════════════════════════════
  console.log('👤 Creando usuarios...');
  const pw = await hash('Test1234!');

  const [admin, maria, pedro, ana, laura, carlos_u, sofia_u, tomas_u] = await Usuario.bulkCreate([
    { nombre:'Admin',  apellido:'Sistema',  email:'admin@conectatea.app',          password_hash:pw, rol:'admin',     avatar:'⚙️',  activo:true, email_verificado:true },
    { nombre:'María',  apellido:'García',   email:'maria@familia.com',             password_hash:pw, rol:'padre',     avatar:'👩',  activo:true, email_verificado:true },
    { nombre:'Pedro',  apellido:'López',    email:'pedro@familia.com',             password_hash:pw, rol:'padre',     avatar:'👨',  activo:true, email_verificado:true },
    { nombre:'Ana',    apellido:'Rodríguez',email:'ana@terapeuta.com',             password_hash:pw, rol:'terapeuta', avatar:'🧑‍⚕️', activo:true, email_verificado:true },
    { nombre:'Laura',  apellido:'Martínez', email:'laura@colegio.edu',             password_hash:pw, rol:'docente',   avatar:'🧑‍🏫', activo:true, email_verificado:true },
    { nombre:'Carlos', apellido:'García',   email:null, password_hash:null,        rol:'nino',       avatar:'🧒',  activo:true, email_verificado:true },
    { nombre:'Sofía',  apellido:'López',    email:null, password_hash:null,        rol:'nino',       avatar:'👧',  activo:true, email_verificado:true },
    { nombre:'Tomás',  apellido:'Ruiz',     email:null, password_hash:null,        rol:'nino',       avatar:'🧒',  activo:true, email_verificado:true },
  ], { individualHooks: false }); // skip bcrypt hook (ya hasheado)

  console.log(`   ✓ ${8} usuarios`);

  // ════════════════════════════════════════
  //  2. PERFILES DE NIÑOS
  // ════════════════════════════════════════
  console.log('👦 Creando perfiles de niños...');
  await Nino.bulkCreate([
    {
      usuario_id: carlos_u.id, nombre_preferido:'Carlitos', edad:8,
      nivel_tea:'2_moderado', tipo_comunicacion:'verbal',
      intereses: JSON.stringify(['dinosaurios','trenes','números']),
      sensibilidades: JSON.stringify(['ruidos_fuertes','texturas_rugosas']),
      nivel_percepcion:72, nivel_cognitivo:80, nivel_lenguaje:60,
      nivel_lectomatem:75, nivel_lectura:78, nivel_escritura:70, nivel_matematicas:80, nivel_social:45, nivel_vida_diaria:85,
      puntos_totales:950, racha_dias:5,
      audio_activo:true, audio_velocidad:0.82, audio_leer_opciones:true, audio_repetir_pregunta:true,
    },
    {
      usuario_id: sofia_u.id, nombre_preferido:'Sofi', edad:6,
      nivel_tea:'1_leve', tipo_comunicacion:'mixto_caa',
      intereses: JSON.stringify(['animales','colores','música']),
      sensibilidades: JSON.stringify(['luces_brillantes']),
      nivel_percepcion:60, nivel_cognitivo:68, nivel_lenguaje:52,
      nivel_lectomatem:58, nivel_lectura:55, nivel_escritura:52, nivel_matematicas:62, nivel_social:40, nivel_vida_diaria:70,
      puntos_totales:540, racha_dias:3,
      audio_activo:true, audio_velocidad:0.75, audio_leer_opciones:true, audio_repetir_pregunta:true,
    },
    {
      usuario_id: tomas_u.id, nombre_preferido:'Tomi', edad:10,
      nivel_tea:'3_severo', tipo_comunicacion:'no_verbal',
      intereses: JSON.stringify(['agua','texturas_suaves','música_calma']),
      sensibilidades: JSON.stringify(['multitudes','cambios_rutina','ruido']),
      nivel_percepcion:35, nivel_cognitivo:40, nivel_lenguaje:20,
      nivel_lectomatem:32, nivel_lectura:28, nivel_escritura:25, nivel_matematicas:35, nivel_social:18, nivel_vida_diaria:50,
      puntos_totales:210, racha_dias:1,
      audio_activo:true, audio_velocidad:0.65, audio_leer_opciones:true, audio_repetir_pregunta:true,
    },
  ]);

  // ════════════════════════════════════════
  //  3. RELACIONES
  // ════════════════════════════════════════
  console.log('🔗 Creando relaciones...');
  await Relacion.bulkCreate([
    { adulto_id:maria.id,  nino_id:carlos_u.id, tipo:'madre',     activo:true },
    { adulto_id:ana.id,    nino_id:carlos_u.id, tipo:'terapeuta', activo:true },
    { adulto_id:laura.id,  nino_id:carlos_u.id, tipo:'docente',   activo:true },
    { adulto_id:pedro.id,  nino_id:sofia_u.id,  tipo:'padre',     activo:true },
    { adulto_id:ana.id,    nino_id:sofia_u.id,  tipo:'terapeuta', activo:true },
    { adulto_id:ana.id,    nino_id:tomas_u.id,  tipo:'terapeuta', activo:true },
  ]);

  // ════════════════════════════════════════
  //  4. ÁREAS DE TRABAJO
  // ════════════════════════════════════════
  console.log('📚 Creando áreas de trabajo...');
  const areas = await Area.bulkCreate([
    { slug:'percepcion',  nombre:'Percepción Funcional',         descripcion:'Procesamiento sensorial, discriminación visual y auditiva, integración sensorial', icono:'👁️', color:'#4C7EF3', gradiente:'linear-gradient(135deg,#4C7EF3,#8B5CF6)', orden:1 },
    { slug:'cognitiva',   nombre:'Área Cognitiva',                descripcion:'Atención, memoria, razonamiento, funciones ejecutivas y resolución de problemas',   icono:'🧠', color:'#8B5CF6', gradiente:'linear-gradient(135deg,#8B5CF6,#6D28D9)', orden:2 },
    { slug:'lenguaje',    nombre:'Lenguaje y Comunicación',       descripcion:'Expresión oral, comprensión, pragmática y comunicación aumentativa alternativa',   icono:'🗣️', color:'#2ECC8E', gradiente:'linear-gradient(135deg,#2ECC8E,#14B8A6)', orden:3 },
    { slug:'lectomatem',  nombre:'Lectoscritura y Matemáticas',   descripcion:'Lectura, escritura, conciencia fonológica, números y resolución de problemas',     icono:'📚', color:'#FF7B5A', gradiente:'linear-gradient(135deg,#FF7B5A,#FF6B6B)', orden:4 },
    { slug:'social',      nombre:'Interacción Social',            descripcion:'Habilidades sociales, empatía, juego cooperativo y comunicación interpersonal',    icono:'🤝', color:'#FFB347', gradiente:'linear-gradient(135deg,#FFB347,#FF6B6B)', orden:5 },
    { slug:'vida_diaria', nombre:'Actividades de la Vida Diaria', descripcion:'Autonomía, higiene personal, alimentación, vestido y rutinas cotidianas',         icono:'🏠', color:'#14B8A6', gradiente:'linear-gradient(135deg,#14B8A6,#2ECC8E)', orden:6 },
  ]);

  // ════════════════════════════════════════
  //  5. ACTIVIDADES
  // ════════════════════════════════════════
  console.log('🎮 Creando actividades...');
  const areaMap = Object.fromEntries(areas.map(a => [a.slug, a.id]));

  const actividades = await Actividad.bulkCreate([
    // ── PERCEPCIÓN ──────────────────────────────
    { area_id:areaMap.percepcion, titulo:'Discriminación de colores', descripcion:'Identifica y nombra colores primarios y secundarios', tipo:'juego', nivel:'basico', tts_habilitado:true, audio_instruccion:'¡Hola! Vamos a aprender los colores. Mira bien el color que te muestro y toca la respuesta correcta. ¡Tú puedes hacerlo!', duracion_min:10, emoji:'🎨', color_fondo:'#EBF1FF',
      contenido: JSON.stringify([
        { p:'¿Qué color es este? 🔴', os:[{e:'🔵',n:'Azul',ok:false},{e:'🔴',n:'Rojo',ok:true},{e:'💛',n:'Amarillo',ok:false},{e:'💚',n:'Verde',ok:false}] },
        { p:'¿Cuál es el color AMARILLO?', os:[{e:'💛',n:'Amarillo',ok:true},{e:'🔵',n:'Azul',ok:false},{e:'🔴',n:'Rojo',ok:false},{e:'💜',n:'Morado',ok:false}] },
        { p:'¿Qué color resulta de mezclar rojo y azul?', os:[{e:'💚',n:'Verde',ok:false},{e:'💜',n:'Morado',ok:true},{e:'🟠',n:'Naranja',ok:false},{e:'⬛',n:'Negro',ok:false}] },
      ]), puntos_max:100, destacada:true, creado_por:ana.id },

    { area_id:areaMap.percepcion, titulo:'Figuras geométricas', descripcion:'Reconoce círculo, cuadrado, triángulo y rectángulo', tipo:'juego', nivel:'basico', duracion_min:12, emoji:'🔷', color_fondo:'#EBF1FF',
      contenido: JSON.stringify([
        { p:'¿Cuál es el CÍRCULO?', os:[{e:'⬜',n:'Cuadrado',ok:false},{e:'⭕',n:'Círculo',ok:true},{e:'🔺',n:'Triángulo',ok:false},{e:'📏',n:'Rectángulo',ok:false}] },
        { p:'¿Cuántos lados tiene un triángulo?', os:[{e:'2️⃣',n:'Dos',ok:false},{e:'3️⃣',n:'Tres',ok:true},{e:'4️⃣',n:'Cuatro',ok:false},{e:'5️⃣',n:'Cinco',ok:false}] },
      ]), puntos_max:100, creado_por:ana.id },

    { area_id:areaMap.percepcion, titulo:'Patrones y secuencias', descripcion:'Completa patrones de colores y formas', tipo:'juego', nivel:'intermedio', duracion_min:15, emoji:'🔁', color_fondo:'#EBF1FF',
      contenido: JSON.stringify([
        { p:'🔴🔵🔴🔵🔴... ¿Qué sigue?', os:[{e:'💚',n:'Verde',ok:false},{e:'🔵',n:'Azul',ok:true},{e:'💛',n:'Amarillo',ok:false},{e:'🔴',n:'Rojo',ok:false}] },
        { p:'🔺⬜🔺⬜... ¿Qué sigue?', os:[{e:'⭕',n:'Círculo',ok:false},{e:'🔺',n:'Triángulo',ok:true},{e:'⬛',n:'Cuadrado',ok:false},{e:'🔷',n:'Rombo',ok:false}] },
      ]), puntos_max:100, creado_por:ana.id },

    { area_id:areaMap.percepcion, titulo:'Percepción espacial', descripcion:'Comprende posiciones: arriba, abajo, izquierda, derecha, dentro, fuera', tipo:'juego', nivel:'avanzado', duracion_min:18, emoji:'📐', color_fondo:'#EBF1FF',
      contenido: JSON.stringify([
        { p:'La pelota está _____ de la caja 📦⬜', os:[{e:'🔼',n:'Arriba',ok:true},{e:'🔽',n:'Abajo',ok:false},{e:'◀️',n:'Izquierda',ok:false},{e:'▶️',n:'Derecha',ok:false}] },
      ]), puntos_max:150, creado_por:ana.id },

    // ── COGNITIVA ──────────────────────────────
    { area_id:areaMap.cognitiva, titulo:'Atención sostenida', descripcion:'Mantén el foco en una tarea durante varios minutos', tipo:'juego', nivel:'basico', tts_habilitado:true, audio_instruccion:'¡Muy bien! Ahora vamos a contar. Fíjate muy bien en los objetos y dime cuántos hay. ¡Escucha la pregunta!', duracion_min:10, emoji:'🎯', color_fondo:'#F0EBFF',
      contenido: JSON.stringify([
        { p:'¿Cuántas ⭐ hay? ⭐⭐⭐', os:[{e:'2️⃣',n:'Dos',ok:false},{e:'3️⃣',n:'Tres',ok:true},{e:'4️⃣',n:'Cuatro',ok:false},{e:'1️⃣',n:'Una',ok:false}] },
        { p:'¿Cuántas 🍎? 🍎🍎🍎🍎', os:[{e:'3️⃣',n:'Tres',ok:false},{e:'5️⃣',n:'Cinco',ok:false},{e:'4️⃣',n:'Cuatro',ok:true},{e:'2️⃣',n:'Dos',ok:false}] },
        { p:'¿Cuántos 🐶? 🐶🐶🐶🐶🐶', os:[{e:'4️⃣',n:'Cuatro',ok:false},{e:'6️⃣',n:'Seis',ok:false},{e:'5️⃣',n:'Cinco',ok:true},{e:'3️⃣',n:'Tres',ok:false}] },
      ]), puntos_max:100, destacada:true, creado_por:ana.id },

    { area_id:areaMap.cognitiva, titulo:'Memoria a corto plazo', descripcion:'Recuerda objetos y secuencias', tipo:'juego', nivel:'basico', duracion_min:12, emoji:'🧠', color_fondo:'#F0EBFF',
      contenido: JSON.stringify([
        { p:'Recuerda: 🐱 🍎 🚗. ¿Cuál NO viste?', os:[{e:'🐱',n:'Gato',ok:false},{e:'🍎',n:'Manzana',ok:false},{e:'🚗',n:'Carro',ok:false},{e:'🏠',n:'Casa',ok:true}] },
        { p:'¿Cuál va primero en la secuencia? 🔴🔵🟡', os:[{e:'🔵',n:'Azul',ok:false},{e:'🟡',n:'Amarillo',ok:false},{e:'🔴',n:'Rojo',ok:true},{e:'💚',n:'Verde',ok:false}] },
      ]), puntos_max:100, creado_por:ana.id },

    { area_id:areaMap.cognitiva, titulo:'Clasificación por categorías', descripcion:'Agrupa objetos: animales, frutas, juguetes, ropa', tipo:'juego', nivel:'basico', duracion_min:10, emoji:'🗂️', color_fondo:'#F0EBFF',
      contenido: JSON.stringify([
        { p:'¿Cuál es un ANIMAL?', os:[{e:'🍎',n:'Manzana',ok:false},{e:'🐶',n:'Perro',ok:true},{e:'🚗',n:'Carro',ok:false},{e:'👕',n:'Camiseta',ok:false}] },
        { p:'¿Cuál es una FRUTA?', os:[{e:'🐱',n:'Gato',ok:false},{e:'🪑',n:'Silla',ok:false},{e:'🍌',n:'Plátano',ok:true},{e:'✏️',n:'Lápiz',ok:false}] },
      ]), puntos_max:100, creado_por:ana.id },

    { area_id:areaMap.cognitiva, titulo:'Resolución de problemas', descripcion:'Encuentra la solución paso a paso', tipo:'juego', nivel:'intermedio', duracion_min:15, emoji:'💡', color_fondo:'#F0EBFF',
      contenido: JSON.stringify([
        { p:'María tiene 5 🍎 y come 2. ¿Cuántas le quedan?', os:[{e:'2️⃣',n:'Dos',ok:false},{e:'4️⃣',n:'Cuatro',ok:false},{e:'3️⃣',n:'Tres',ok:true},{e:'5️⃣',n:'Cinco',ok:false}] },
        { p:'Si 2 + 3 = 5, ¿cuánto es 3 + 3?', os:[{e:'5️⃣',n:'Cinco',ok:false},{e:'7️⃣',n:'Siete',ok:false},{e:'6️⃣',n:'Seis',ok:true},{e:'4️⃣',n:'Cuatro',ok:false}] },
      ]), puntos_max:120, creado_por:ana.id },

    { area_id:areaMap.cognitiva, titulo:'Pensamiento flexible', descripcion:'Cambia entre reglas y perspectivas distintas', tipo:'juego', nivel:'avanzado', duracion_min:20, emoji:'🌀', color_fondo:'#F0EBFF',
      contenido: JSON.stringify([
        { p:'Si todos los perros son animales y Rex es un perro, entonces Rex es…', os:[{e:'🐱',n:'Un gato',ok:false},{e:'🌿',n:'Una planta',ok:false},{e:'🐾',n:'Un animal',ok:true},{e:'🚗',n:'Un vehículo',ok:false}] },
      ]), puntos_max:150, creado_por:ana.id },

    // ── LENGUAJE ───────────────────────────────
    { area_id:areaMap.lenguaje, titulo:'Vocabulario básico', descripcion:'Nombra objetos cotidianos', tipo:'juego', nivel:'basico', tts_habilitado:true, audio_instruccion:'¡Vamos a aprender palabras nuevas! Te voy a mostrar un objeto. Escúchame y toca la respuesta correcta. ¡Adelante!', duracion_min:10, emoji:'🔤', color_fondo:'#E3F9F1',
      contenido: JSON.stringify([
        { p:'¿Cómo se llama esto? 🍎', os:[{e:'🍌',n:'Plátano',ok:false},{e:'🍊',n:'Naranja',ok:false},{e:'🍎',n:'Manzana',ok:true},{e:'🍇',n:'Uva',ok:false}] },
        { p:'¿Cómo se llama esto? 🐶', os:[{e:'🐱',n:'Gato',ok:false},{e:'🐶',n:'Perro',ok:true},{e:'🐦',n:'Pájaro',ok:false},{e:'🐟',n:'Pez',ok:false}] },
        { p:'¿Cómo se llama esto? 🚗', os:[{e:'🚌',n:'Autobús',ok:false},{e:'✈️',n:'Avión',ok:false},{e:'🚗',n:'Carro',ok:true},{e:'🚂',n:'Tren',ok:false}] },
      ]), puntos_max:100, destacada:true, creado_por:ana.id },

    { area_id:areaMap.lenguaje, titulo:'Instrucciones de 1-2 pasos', descripcion:'Sigue instrucciones simples', tipo:'comunicacion', nivel:'basico', duracion_min:12, emoji:'👂', color_fondo:'#E3F9F1',
      contenido: JSON.stringify([
        { p:'"Dame la manzana" — ¿Qué debo hacer?', os:[{e:'🏃',n:'Correr',ok:false},{e:'🤲',n:'Dar la manzana',ok:true},{e:'😴',n:'Dormir',ok:false},{e:'🎵',n:'Cantar',ok:false}] },
        { p:'"Siéntate y escucha" — ¿Cuántas cosas debo hacer?', os:[{e:'1️⃣',n:'Una',ok:false},{e:'2️⃣',n:'Dos',ok:true},{e:'3️⃣',n:'Tres',ok:false},{e:'4️⃣',n:'Cuatro',ok:false}] },
      ]), puntos_max:100, creado_por:ana.id },

    { area_id:areaMap.lenguaje, titulo:'Construcción de frases', descripcion:'Forma oraciones de 3-4 palabras', tipo:'juego', nivel:'intermedio', duracion_min:15, emoji:'📝', color_fondo:'#E3F9F1',
      contenido: JSON.stringify([
        { p:'Ordena: "come / el / niño / manzana"', os:[{e:'A',n:'come manzana niño el',ok:false},{e:'B',n:'El niño come manzana',ok:true},{e:'C',n:'manzana come el niño',ok:false},{e:'D',n:'niño el come manzana',ok:false}] },
      ]), puntos_max:120, creado_por:ana.id },

    { area_id:areaMap.lenguaje, titulo:'Comunicación aumentativa AAC', descripcion:'Usa pictogramas para expresar necesidades complejas', tipo:'pictos', nivel:'avanzado', duracion_min:20, emoji:'💬', color_fondo:'#E3F9F1',
      contenido: JSON.stringify([
        { p:'¿Qué pictograma usas para decir "quiero agua"?', os:[{e:'🍎',n:'Manzana',ok:false},{e:'💧',n:'Agua',ok:true},{e:'🎮',n:'Juego',ok:false},{e:'🏠',n:'Casa',ok:false}] },
        { p:'¿Cuál usas para pedir ayuda?', os:[{e:'✅',n:'Sí',ok:false},{e:'🆘',n:'Ayuda',ok:true},{e:'❌',n:'No',ok:false},{e:'🎵',n:'Música',ok:false}] },
      ]), puntos_max:150, creado_por:ana.id },

    // ── LECTOMATEM ────────────────────────────
    { area_id:areaMap.lectomatem, subcarpeta:'Lectura', titulo:'📗 Lectura — Básico: Conciencia fonológica', descripcion:'Reconoce letras, sonidos iniciales y pictogramas', tipo:'lectura', nivel:'basico', duracion_min:12, emoji:'📗', color_fondo:'#FFF0EC',
      contenido: JSON.stringify([
        { p:'¿Con qué letra empieza 🍎 manzana?', os:[{e:'P',n:'P',ok:false},{e:'M',n:'M de Mamá',ok:true},{e:'S',n:'S',ok:false},{e:'T',n:'T',ok:false}] },
        { p:'¿Con qué letra empieza 🐱 gato?', os:[{e:'P',n:'P',ok:false},{e:'G',n:'G de Gato',ok:true},{e:'C',n:'C',ok:false},{e:'T',n:'T',ok:false}] },
      ]), puntos_max:100, creado_por:laura.id },

    { area_id:areaMap.lectomatem, subcarpeta:'Matemáticas', titulo:'🔢 Matemáticas — Básico: Números del 1 al 10', descripcion:'Reconoce, lee y cuenta hasta 10', tipo:'matematicas', nivel:'basico', duracion_min:10, emoji:'🔢', color_fondo:'#FFF0EC',
      contenido: JSON.stringify([
        { p:'¿Cuántas ⭐? ⭐⭐⭐⭐', os:[{e:'3️⃣',n:'Tres',ok:false},{e:'5️⃣',n:'Cinco',ok:false},{e:'4️⃣',n:'Cuatro',ok:true},{e:'2️⃣',n:'Dos',ok:false}] },
        { p:'¿Qué número sigue? 1, 2, 3, ___', os:[{e:'5️⃣',n:'Cinco',ok:false},{e:'4️⃣',n:'Cuatro',ok:true},{e:'8️⃣',n:'Ocho',ok:false},{e:'2️⃣',n:'Dos',ok:false}] },
        { p:'¿Cuánto es 2 + 3?', os:[{e:'4️⃣',n:'Cuatro',ok:false},{e:'6️⃣',n:'Seis',ok:false},{e:'5️⃣',n:'Cinco',ok:true},{e:'3️⃣',n:'Tres',ok:false}] },
      ]), puntos_max:100, destacada:true, creado_por:laura.id },

    { area_id:areaMap.lectomatem, subcarpeta:'Lectura', titulo:'📘 Lectura — Intermedio: Sílabas y palabras', descripcion:'Lee sílabas directas y forma palabras simples', tipo:'lectura', nivel:'intermedio', duracion_min:15, emoji:'📘', color_fondo:'#FFF0EC',
      contenido: JSON.stringify([
        { p:'¿Qué sílaba forman M + A?', os:[{e:'ME',n:'ME',ok:false},{e:'MA',n:'MA',ok:true},{e:'MI',n:'MI',ok:false},{e:'MO',n:'MO',ok:false}] },
        { p:'¿Qué palabra forma PA-PÁ?', os:[{e:'🐱',n:'Gato',ok:false},{e:'👨',n:'Papá',ok:true},{e:'🏠',n:'Casa',ok:false},{e:'🌳',n:'Árbol',ok:false}] },
      ]), puntos_max:120, creado_por:laura.id },

    { area_id:areaMap.lectomatem, subcarpeta:'Matemáticas', titulo:'➕ Matemáticas — Intermedio: Sumas y restas', descripcion:'Resuelve operaciones hasta 20 con apoyo visual', tipo:'matematicas', nivel:'intermedio', duracion_min:15, emoji:'➕', color_fondo:'#FFF0EC',
      contenido: JSON.stringify([
        { p:'7 + 5 = ?', os:[{e:'11',n:'Once',ok:false},{e:'13',n:'Trece',ok:false},{e:'12',n:'Doce',ok:true},{e:'10',n:'Diez',ok:false}] },
        { p:'15 - 7 = ?', os:[{e:'6️⃣',n:'Seis',ok:false},{e:'9️⃣',n:'Nueve',ok:false},{e:'8️⃣',n:'Ocho',ok:true},{e:'7️⃣',n:'Siete',ok:false}] },
      ]), puntos_max:120, creado_por:laura.id },

    { area_id:areaMap.lectomatem, subcarpeta:'Lectura', titulo:'📕 Lectura — Avanzado: Comprensión lectora', descripcion:'Lee textos cortos y responde preguntas de comprensión', tipo:'lectura', nivel:'avanzado', duracion_min:25, emoji:'📕', color_fondo:'#FFF0EC',
      contenido: JSON.stringify([
        { p:'"Carlos tiene 3 🍎. Le da 1 a su amigo. ¿Cuántas le quedan?"', os:[{e:'2️⃣',n:'Dos',ok:true},{e:'4️⃣',n:'Cuatro',ok:false},{e:'1️⃣',n:'Una',ok:false},{e:'3️⃣',n:'Tres',ok:false}] },
      ]), puntos_max:150, creado_por:laura.id },

    // ── SOCIAL ────────────────────────────────
    { area_id:areaMap.social, titulo:'Reconocer emociones en otros', descripcion:'Identifica la emoción por la expresión facial', tipo:'emocion', nivel:'basico', duracion_min:10, emoji:'😊', color_fondo:'#FFF6E8',
      contenido: JSON.stringify([
        { p:'¿Cómo se siente este niño? 😢', os:[{e:'😊',n:'Feliz',ok:false},{e:'😢',n:'Triste',ok:true},{e:'😠',n:'Enojado',ok:false},{e:'😨',n:'Asustado',ok:false}] },
        { p:'¿Cómo se siente? 🥳', os:[{e:'😢',n:'Triste',ok:false},{e:'😠',n:'Enojado',ok:false},{e:'🥳',n:'Muy feliz',ok:true},{e:'😴',n:'Cansado',ok:false}] },
        { p:'¿Qué hace una persona cuando está asustada?', os:[{e:'😄',n:'Ríe mucho',ok:false},{e:'😨',n:'Tiembla y busca ayuda',ok:true},{e:'😴',n:'Se duerme',ok:false},{e:'😋',n:'Come',ok:false}] },
      ]), puntos_max:100, destacada:true, creado_por:ana.id },

    { area_id:areaMap.social, titulo:'Saludos y presentaciones', descripcion:'Aprende cómo saludar y presentarse', tipo:'social', nivel:'basico', duracion_min:10, emoji:'👋', color_fondo:'#FFF6E8',
      contenido: JSON.stringify([
        { p:'¿Qué dices cuando conoces a alguien nuevo?', os:[{e:'🤐',n:'Nada',ok:false},{e:'👋',n:'Hola, me llamo…',ok:true},{e:'😤',n:'Déjame en paz',ok:false},{e:'😴',n:'Tengo sueño',ok:false}] },
        { p:'¿Cómo te despides de un amigo?', os:[{e:'👋',n:'Adiós / hasta luego',ok:true},{e:'😠',n:'Me voy enojado',ok:false},{e:'🙈',n:'Sin mirar',ok:false},{e:'😴',n:'Me duermo',ok:false}] },
      ]), puntos_max:100, creado_por:ana.id },

    { area_id:areaMap.social, titulo:'Turnos en conversación', descripcion:'Espera y toma el turno para hablar', tipo:'social', nivel:'intermedio', duracion_min:15, emoji:'🎤', color_fondo:'#FFF6E8',
      contenido: JSON.stringify([
        { p:'Mi amigo está hablando. Yo debo…', os:[{e:'📢',n:'Interrumpirle',ok:false},{e:'👂',n:'Escuchar y esperar',ok:true},{e:'🏃',n:'Irme',ok:false},{e:'😴',n:'Ignorarle',ok:false}] },
      ]), puntos_max:120, creado_por:ana.id },

    { area_id:areaMap.social, titulo:'Resolución de conflictos', descripcion:'Aprende a resolver desacuerdos de forma pacífica', tipo:'social', nivel:'avanzado', duracion_min:20, emoji:'🤝', color_fondo:'#FFF6E8',
      contenido: JSON.stringify([
        { p:'Mi amigo y yo queremos el mismo juguete. ¿Qué hacemos?', os:[{e:'😠',n:'Pelear',ok:false},{e:'🤝',n:'Compartir y turnarnos',ok:true},{e:'😭',n:'Llorar y rendirme',ok:false},{e:'🏃',n:'Huir',ok:false}] },
      ]), puntos_max:150, creado_por:ana.id },

    // ── VIDA DIARIA ───────────────────────────
    { area_id:areaMap.vida_diaria, titulo:'Rutina de lavado de manos', descripcion:'Aprende los 6 pasos del lavado correcto', tipo:'rutina', nivel:'basico', duracion_min:8, emoji:'🙌', color_fondo:'#E0F7F5',
      contenido: JSON.stringify([
        { p:'¿Cuándo debo lavarme las manos?', os:[{e:'🎮',n:'Al jugar',ok:false},{e:'🍽️',n:'Antes de comer',ok:true},{e:'📺',n:'Al ver TV',ok:false},{e:'😴',n:'Al dormir',ok:false}] },
        { p:'¿Con qué me lavo las manos?', os:[{e:'🧃',n:'Jugo',ok:false},{e:'🧼',n:'Jabón y agua',ok:true},{e:'🍎',n:'Manzana',ok:false},{e:'🪣',n:'Solo agua',ok:false}] },
      ]), puntos_max:80, destacada:true, creado_por:ana.id },

    { area_id:areaMap.vida_diaria, titulo:'Vestirse solo/a', descripcion:'Aprende el orden para ponerse la ropa', tipo:'rutina', nivel:'basico', duracion_min:10, emoji:'👕', color_fondo:'#E0F7F5',
      contenido: JSON.stringify([
        { p:'¿Qué te pones primero?', os:[{e:'🧥',n:'El abrigo',ok:false},{e:'🩲',n:'La ropa interior',ok:true},{e:'🧢',n:'El gorro',ok:false},{e:'👟',n:'Los zapatos',ok:false}] },
        { p:'¿Los zapatos van en…?', os:[{e:'🙌',n:'Las manos',ok:false},{e:'👟',n:'Los pies',ok:true},{e:'🧢',n:'La cabeza',ok:false},{e:'🤗',n:'El cuello',ok:false}] },
      ]), puntos_max:80, creado_por:ana.id },

    { area_id:areaMap.vida_diaria, titulo:'Preparar una merienda sencilla', descripcion:'Aprende a preparar alimentos simples con seguridad', tipo:'rutina', nivel:'intermedio', duracion_min:15, emoji:'🍞', color_fondo:'#E0F7F5',
      contenido: JSON.stringify([
        { p:'Para hacer un sándwich necesito…', os:[{e:'🍳',n:'La sartén caliente',ok:false},{e:'🍞',n:'Pan y relleno',ok:true},{e:'🥘',n:'Una olla',ok:false},{e:'🔥',n:'Fuego directo',ok:false}] },
      ]), puntos_max:120, creado_por:ana.id },

    { area_id:areaMap.vida_diaria, titulo:'Manejo del dinero básico', descripcion:'Entiende monedas, billetes y dar cambio', tipo:'matematicas', nivel:'avanzado', duracion_min:20, emoji:'💰', color_fondo:'#E0F7F5',
      contenido: JSON.stringify([
        { p:'Algo cuesta $3.000 y doy $5.000. ¿Cuánto de cambio recibo?', os:[{e:'$1.000',n:'Mil pesos',ok:false},{e:'$3.000',n:'Tres mil',ok:false},{e:'$2.000',n:'Dos mil',ok:true},{e:'$8.000',n:'Ocho mil',ok:false}] },
      ]), puntos_max:150, creado_por:ana.id },
  ], { individualHooks: false });

  console.log(`   ✓ ${actividades.length} actividades`);

  // ════════════════════════════════════════
  //  6. EMOCIONES
  // ════════════════════════════════════════
  console.log('😊 Creando emociones...');
  const emociones = await Emocion.bulkCreate([
    { nombre:'Feliz',       emoji:'😄', color:'#FFB347', color_fondo:'#FFF6E8', categoria:'basica',   orden:1, estrategias: JSON.stringify(['Comparte tu alegría 🤗','Canta tu canción favorita 🎵','Baila un poco 💃','Dibuja cómo te sientes 🎨']) },
    { nombre:'Triste',      emoji:'😢', color:'#4C7EF3', color_fondo:'#EBF1FF', categoria:'basica',   orden:2, estrategias: JSON.stringify(['Respira 3 veces despacio 🫁','Busca un abrazo 🤗','Escucha música tranquila','Habla con alguien de confianza']) },
    { nombre:'Enojado',     emoji:'😠', color:'#FF6B6B', color_fondo:'#FFF0F0', categoria:'basica',   orden:3, estrategias: JSON.stringify(['Cuenta hasta 10 🔢','Ve a tu espacio de calma','Aprieta una pelota blanda 🟡','Respira como globo 🫁']) },
    { nombre:'Asustado',    emoji:'😨', color:'#8B5CF6', color_fondo:'#F0EBFF', categoria:'basica',   orden:4, estrategias: JSON.stringify(['Busca a un adulto 🤗','Toca algo suave y familiar 🧸','Recuerda: estás seguro/a ✅','Respira despacio 🫁']) },
    { nombre:'Tranquilo',   emoji:'😌', color:'#2ECC8E', color_fondo:'#E3F9F1', categoria:'basica',   orden:5, estrategias: JSON.stringify(['¡Qué bien! Disfruta el momento 🌟','Sigue con lo que estás haciendo','Sonríe 😊']) },
    { nombre:'Sorprendido', emoji:'😲', color:'#FF7B5A', color_fondo:'#FFF0EC', categoria:'basica',   orden:6, estrategias: JSON.stringify(['Para y respira','Pregunta qué pasó 🤔','Todo está bien ✅']) },
    { nombre:'Frustrado',   emoji:'😤', color:'#FF7B5A', color_fondo:'#FFF0EC', categoria:'compleja', orden:7, estrategias: JSON.stringify(['Pide ayuda 🙋','Toma un descanso ⏸️','Inténtalo de otra forma 🔄','Respiración de barriga 🫁']) },
    { nombre:'Nervioso',    emoji:'😰', color:'#14B8A6', color_fondo:'#E0F7F5', categoria:'compleja', orden:8, estrategias: JSON.stringify(['Camina despacio 🚶','Habla con alguien de confianza','Juego sensorial: toca cosas suaves','Dite: "Yo puedo" 💪']) },
    { nombre:'Cansado',     emoji:'😴', color:'#94A3B8', color_fondo:'#F0F4FF', categoria:'corporal', orden:9, estrategias: JSON.stringify(['Descansa si puedes 💤','Toma agua 💧','Haz un estiramiento suave','Díselo a un adulto']) },
    { nombre:'Emocionado',  emoji:'🥳', color:'#FFB347', color_fondo:'#FFF6E8', categoria:'basica',  orden:10, estrategias: JSON.stringify(['¡Celébralo! 🎉','Compártelo con alguien','Haz algo creativo 🎨','Canta o baila']) },
    { nombre:'Abrumado',    emoji:'😵', color:'#FF6B6B', color_fondo:'#FFF0F0', categoria:'compleja',orden:11, estrategias: JSON.stringify(['Para todo y respira 🛑','Ve a tu espacio seguro 🏝️','Pide un descanso ⏸️','Reduce estímulos: luz, ruido']) },
    { nombre:'Orgulloso',   emoji:'😎', color:'#8B5CF6', color_fondo:'#F0EBFF', categoria:'compleja',orden:12, estrategias: JSON.stringify(['¡Te lo mereces! 🌟','Cuéntaselo a alguien especial ❤️','Escríbelo o dibújalo','¡Choca esos cinco! 🙌']) },
  ]);
  console.log(`   ✓ ${emociones.length} emociones`);

  // ════════════════════════════════════════
  //  7. PICTOGRAMAS
  // ════════════════════════════════════════
  console.log('💬 Creando pictogramas...');
  await Pictograma.bulkCreate([
    {palabra:'Hola',       categoria:'saludos',      emoji:'👋', color:'#4C7EF3', color_fondo:'#EBF1FF', orden:1},
    {palabra:'Adiós',      categoria:'saludos',      emoji:'🤚', color:'#4C7EF3', color_fondo:'#EBF1FF', orden:2},
    {palabra:'Buenos días',categoria:'saludos',      emoji:'🌅', color:'#FFB347', color_fondo:'#FFF6E8', orden:3},
    {palabra:'Gracias',    categoria:'cortesia',     emoji:'🙏', color:'#2ECC8E', color_fondo:'#E3F9F1', orden:1},
    {palabra:'Por favor',  categoria:'cortesia',     emoji:'🤲', color:'#2ECC8E', color_fondo:'#E3F9F1', orden:2},
    {palabra:'Lo siento',  categoria:'cortesia',     emoji:'😔', color:'#8B5CF6', color_fondo:'#F0EBFF', orden:3},
    {palabra:'Agua',       categoria:'necesidades',  emoji:'💧', color:'#4C7EF3', color_fondo:'#EBF1FF', orden:1},
    {palabra:'Comida',     categoria:'necesidades',  emoji:'🍽️',color:'#FFB347', color_fondo:'#FFF6E8', orden:2},
    {palabra:'Baño',       categoria:'necesidades',  emoji:'🚿', color:'#8B5CF6', color_fondo:'#F0EBFF', orden:3},
    {palabra:'Dormir',     categoria:'necesidades',  emoji:'😴', color:'#94A3B8', color_fondo:'#F0F4FF', orden:4},
    {palabra:'Dolor',      categoria:'necesidades',  emoji:'🤕', color:'#FF6B6B', color_fondo:'#FFF0F0', orden:5},
    {palabra:'Ayuda',      categoria:'necesidades',  emoji:'🆘', color:'#FFB347', color_fondo:'#FFF6E8', orden:6},
    {palabra:'Frío',       categoria:'necesidades',  emoji:'🥶', color:'#4C7EF3', color_fondo:'#EBF1FF', orden:7},
    {palabra:'Calor',      categoria:'necesidades',  emoji:'🥵', color:'#FF7B5A', color_fondo:'#FFF0EC', orden:8},
    {palabra:'Jugar',      categoria:'actividades',  emoji:'🎮', color:'#FF7B5A', color_fondo:'#FFF0EC', orden:1},
    {palabra:'Estudiar',   categoria:'actividades',  emoji:'📚', color:'#4C7EF3', color_fondo:'#EBF1FF', orden:2},
    {palabra:'Música',     categoria:'actividades',  emoji:'🎵', color:'#8B5CF6', color_fondo:'#F0EBFF', orden:3},
    {palabra:'Dibujar',    categoria:'actividades',  emoji:'🎨', color:'#FF6B6B', color_fondo:'#FFF0F0', orden:4},
    {palabra:'Casa',       categoria:'lugares',      emoji:'🏠', color:'#FFB347', color_fondo:'#FFF6E8', orden:1},
    {palabra:'Colegio',    categoria:'lugares',      emoji:'🏫', color:'#2ECC8E', color_fondo:'#E3F9F1', orden:2},
    {palabra:'Parque',     categoria:'lugares',      emoji:'🌳', color:'#2ECC8E', color_fondo:'#E3F9F1', orden:3},
    {palabra:'Médico',     categoria:'lugares',      emoji:'🏥', color:'#FF6B6B', color_fondo:'#FFF0F0', orden:4},
    {palabra:'Mamá',       categoria:'familia',      emoji:'👩', color:'#FF6B6B', color_fondo:'#FFF0F0', orden:1},
    {palabra:'Papá',       categoria:'familia',      emoji:'👨', color:'#4C7EF3', color_fondo:'#EBF1FF', orden:2},
    {palabra:'Abuela',     categoria:'familia',      emoji:'👵', color:'#FFB347', color_fondo:'#FFF6E8', orden:3},
    {palabra:'Abuelo',     categoria:'familia',      emoji:'👴', color:'#FFB347', color_fondo:'#FFF6E8', orden:4},
    {palabra:'Sí',         categoria:'respuestas',   emoji:'✅', color:'#2ECC8E', color_fondo:'#E3F9F1', orden:1},
    {palabra:'No',         categoria:'respuestas',   emoji:'❌', color:'#FF6B6B', color_fondo:'#FFF0F0', orden:2},
    {palabra:'No sé',      categoria:'respuestas',   emoji:'🤷', color:'#94A3B8', color_fondo:'#F0F4FF', orden:3},
    {palabra:'Espera',     categoria:'instrucciones',emoji:'⏳', color:'#FFB347', color_fondo:'#FFF6E8', orden:1},
    {palabra:'Listo',      categoria:'instrucciones',emoji:'🎉', color:'#2ECC8E', color_fondo:'#E3F9F1', orden:2},
    {palabra:'Para',       categoria:'instrucciones',emoji:'🛑', color:'#FF6B6B', color_fondo:'#FFF0F0', orden:3},
    {palabra:'Más',        categoria:'instrucciones',emoji:'➕', color:'#4C7EF3', color_fondo:'#EBF1FF', orden:4},
    {palabra:'Ir',         categoria:'instrucciones',emoji:'🚶', color:'#2ECC8E', color_fondo:'#E3F9F1', orden:5},
    {palabra:'Amigo',      categoria:'social',       emoji:'👫', color:'#8B5CF6', color_fondo:'#F0EBFF', orden:1},
    {palabra:'Comparte',   categoria:'social',       emoji:'🤝', color:'#2ECC8E', color_fondo:'#E3F9F1', orden:2},
    {palabra:'Turno',      categoria:'social',       emoji:'🔄', color:'#4C7EF3', color_fondo:'#EBF1FF', orden:3},
    {palabra:'Feliz',      categoria:'emociones',    emoji:'😊', color:'#FFB347', color_fondo:'#FFF6E8', orden:1},
    {palabra:'Triste',     categoria:'emociones',    emoji:'😢', color:'#4C7EF3', color_fondo:'#EBF1FF', orden:2},
    {palabra:'Enojado',    categoria:'emociones',    emoji:'😠', color:'#FF6B6B', color_fondo:'#FFF0F0', orden:3},
    {palabra:'Asustado',   categoria:'emociones',    emoji:'😨', color:'#8B5CF6', color_fondo:'#F0EBFF', orden:4},
  ]);
  console.log(`   ✓ 40 pictogramas`);

  // ════════════════════════════════════════
  //  8. RUTINAS
  // ════════════════════════════════════════
  console.log('📅 Creando rutinas...');
  const rutinas = await Rutina.bulkCreate([
    { nino_id:carlos_u.id, nombre:'Rutina de la Mañana', emoji:'🌅', color:'#4C7EF3', hora_inicio:'07:00', dias: JSON.stringify(['lunes','martes','miercoles','jueves','viernes']), es_publica:false, creado_por:ana.id },
    { nino_id:carlos_u.id, nombre:'Rutina de la Noche',  emoji:'🌙', color:'#8B5CF6', hora_inicio:'20:00', dias: JSON.stringify(['lunes','martes','miercoles','jueves','viernes','sabado','domingo']), es_publica:false, creado_por:ana.id },
    { nino_id:null, nombre:'En el Colegio',               emoji:'🏫', color:'#2ECC8E', hora_inicio:'08:00', dias: JSON.stringify(['lunes','martes','miercoles','jueves','viernes']), es_publica:true,  creado_por:laura.id },
    { nino_id:null, nombre:'Hora del Baño',               emoji:'🛁', color:'#FF7B5A', hora_inicio:null,    dias: JSON.stringify(['lunes','martes','miercoles','jueves','viernes','sabado','domingo']), es_publica:true, creado_por:ana.id },
  ]);

  // Pasos de rutinas
  const pasosMañana = [
    {n:'Levantarse de la cama',ico:'🛏️'},{n:'Ir al baño',ico:'🚿'},{n:'Ducharse',ico:'🚿'},
    {n:'Desayunar',ico:'🥣'},{n:'Cepillar los dientes',ico:'🦷'},{n:'Vestirse',ico:'👕'},
    {n:'Preparar la mochila',ico:'🎒'},{n:'Ir al colegio',ico:'🚌'},
  ];
  const pasosNoche = [
    {n:'Cenar con la familia',ico:'🍽️'},{n:'Baño de noche',ico:'🛁'},
    {n:'Cepillar los dientes',ico:'🪥'},{n:'Ponerse el pijama',ico:'🩲'},
    {n:'Leer un cuento',ico:'📖'},{n:'Dormir',ico:'😴'},
  ];
  const pasosColegio = [
    {n:'Saludar al profesor',ico:'👋'},{n:'Guardar la mochila',ico:'🎒'},
    {n:'Sentarse en el puesto',ico:'🪑'},{n:'Sacar útiles',ico:'📚'},
    {n:'Atender la clase',ico:'✏️'},{n:'Recreo y merienda',ico:'🍱'},
    {n:'Despedirme',ico:'👋'},
  ];
  const pasosBaño = [
    {n:'Verificar temperatura del agua',ico:'🌡️'},{n:'Mojar el cuerpo',ico:'💦'},
    {n:'Aplicar shampoo',ico:'🧴'},{n:'Jabonarse el cuerpo',ico:'🧼'},
    {n:'Enjuagarse bien',ico:'💧'},{n:'Secarse con la toalla',ico:'🛁'},
    {n:'Ponerse ropa limpia',ico:'👕'},
  ];

  for (const [i, pasos] of [[0,pasosMañana],[1,pasosNoche],[2,pasosColegio],[3,pasosBaño]]) {
    await PasoRutina.bulkCreate(pasos.map((p, j) => ({
      rutina_id: rutinas[i].id, orden: j, nombre: p.n, icono: p.ico,
    })));
  }
  console.log(`   ✓ 4 rutinas con pasos`);

  // ════════════════════════════════════════
  //  9. PROGRESO EJEMPLO
  // ════════════════════════════════════════
  console.log('📈 Creando progreso de ejemplo...');
  await Progreso.bulkCreate([
    { nino_id:carlos_u.id, actividad_id:actividades[0].id, completada:true,  puntuacion:85, tiempo_seg:420,  nivel_jugado:'basico',     intentos:1 },
    { nino_id:carlos_u.id, actividad_id:actividades[4].id, completada:true,  puntuacion:100, tiempo_seg:360, nivel_jugado:'basico',     intentos:1 },
    { nino_id:carlos_u.id, actividad_id:actividades[9].id, completada:true,  puntuacion:90,  tiempo_seg:540, nivel_jugado:'basico',     intentos:2 },
    { nino_id:carlos_u.id, actividad_id:actividades[14].id,completada:true,  puntuacion:75,  tiempo_seg:480, nivel_jugado:'basico',     intentos:1 },
    { nino_id:carlos_u.id, actividad_id:actividades[7].id, completada:false, puntuacion:40,  tiempo_seg:300, nivel_jugado:'intermedio', intentos:3 },
    { nino_id:sofia_u.id,  actividad_id:actividades[0].id, completada:true,  puntuacion:70,  tiempo_seg:500, nivel_jugado:'basico',     intentos:2 },
    { nino_id:sofia_u.id,  actividad_id:actividades[9].id, completada:true,  puntuacion:80,  tiempo_seg:420, nivel_jugado:'basico',     intentos:1 },
    { nino_id:tomas_u.id,  actividad_id:actividades[0].id, completada:false, puntuacion:30,  tiempo_seg:240, nivel_jugado:'basico',     intentos:4 },
  ]);
  console.log(`   ✓ 8 registros de progreso`);

  // ════════════════════════════════════════
  //  10. REGISTRO EMOCIONAL
  // ════════════════════════════════════════
  console.log('💚 Creando historial emocional...');
  const hoy = new Date();
   await RegistroEmo.bulkCreate([
    { nino_id:carlos_u.id, emocion_id:emociones[0].id, intensidad:4, contexto:'casa',    nota:'Se despertó muy animado',                     fecha: new Date(hoy - 2*3600000) },
    { nino_id:carlos_u.id, emocion_id:emociones[2].id, intensidad:3, contexto:'colegio', nota:'Se enojó porque no encontraba su libro',        fecha: new Date(hoy - 8*3600000) },
    { nino_id:carlos_u.id, emocion_id:emociones[4].id, intensidad:5, contexto:'terapia', nota:'Después de terapia muy tranquilo',              fecha: new Date(hoy - 86400000) },
    { nino_id:carlos_u.id, emocion_id:emociones[9].id, intensidad:4, contexto:'casa',    nota:'Ganó en su juego favorito',                    fecha: new Date(hoy - 2*86400000) },
    { nino_id:sofia_u.id,  emocion_id:emociones[0].id, intensidad:5, contexto:'casa',    nota:'Jugó con su perro toda la tarde',              fecha: new Date(hoy - 3600000) },
    { nino_id:sofia_u.id,  emocion_id:emociones[7].id, intensidad:3, contexto:'colegio', nota:'Mañana hay presentación y estaba nerviosa',    fecha: new Date(hoy - 86400000) },
  ]);
  console.log(`   ✓ 6 registros emocionales`);

  // ════════════════════════════════════════
  //  11. LOGROS
  // ════════════════════════════════════════
  console.log('🏆 Creando logros...');
  const logros = await Logro.bulkCreate([
    { nombre:'Primera estrella',       descripcion:'Completaste tu primera actividad',     emoji:'⭐', color:'#FFB347', condicion_tipo:'actividades', condicion_valor:1,  puntos:50,  orden:1 },
    { nombre:'Explorador curioso',     descripcion:'5 actividades diferentes completadas', emoji:'🔍', color:'#4C7EF3', condicion_tipo:'actividades', condicion_valor:5,  puntos:100, orden:2 },
    { nombre:'Súper aprendiz',         descripcion:'20 actividades completadas',           emoji:'🏆', color:'#FFB347', condicion_tipo:'actividades', condicion_valor:20, puntos:200, orden:3 },
    { nombre:'Racha de 3 días',        descripcion:'3 días consecutivos de práctica',      emoji:'🔥', color:'#FF6B6B', condicion_tipo:'racha',       condicion_valor:3,  puntos:150, orden:4 },
    { nombre:'Semana increíble',       descripcion:'7 días consecutivos',                  emoji:'💫', color:'#8B5CF6', condicion_tipo:'racha',       condicion_valor:7,  puntos:300, orden:5 },
    { nombre:'Maestro emocional',      descripcion:'15 emociones registradas',             emoji:'💚', color:'#2ECC8E', condicion_tipo:'emociones',   condicion_valor:15, puntos:150, orden:6 },
    { nombre:'Comunicador estrella',   descripcion:'Tablero usado 20 veces',               emoji:'💬', color:'#4C7EF3', condicion_tipo:'actividades', condicion_valor:20, puntos:120, orden:7 },
    { nombre:'Rutinas perfectas',      descripcion:'10 rutinas completadas',               emoji:'📅', color:'#14B8A6', condicion_tipo:'actividades', condicion_valor:10, puntos:100, orden:8 },
    { nombre:'Lector voraz',           descripcion:'5 cuentos completados',                emoji:'📚', color:'#8B5CF6', condicion_tipo:'actividades', condicion_valor:5,  puntos:80,  orden:9 },
    { nombre:'Héroe de la calma',      descripcion:'10 sesiones de respiración',           emoji:'🫁', color:'#4C7EF3', condicion_tipo:'actividades', condicion_valor:10, puntos:100, orden:10 },
    { nombre:'Campeón social',         descripcion:'20 actividades sociales completadas',  emoji:'🤝', color:'#FF6B6B', condicion_tipo:'actividades', condicion_valor:20, puntos:200, orden:11 },
    { nombre:'Matemático',             descripcion:'Puntuación perfecta en 3 actividades', emoji:'🔢', color:'#FF7B5A', condicion_tipo:'actividades', condicion_valor:3,  puntos:120, orden:12 },
  ]);

  // Otorgar logros a Carlos
  await LogroUsuario.bulkCreate([
    { usuario_id:carlos_u.id, logro_id:logros[0].id },
    { usuario_id:carlos_u.id, logro_id:logros[1].id },
    { usuario_id:carlos_u.id, logro_id:logros[3].id },
    { usuario_id:carlos_u.id, logro_id:logros[11].id },
    { usuario_id:sofia_u.id,  logro_id:logros[0].id },
  ]);
  console.log(`   ✓ ${logros.length} logros`);

  // ════════════════════════════════════════
  //  12. BLOG POSTS
  // ════════════════════════════════════════
  console.log('📰 Creando blog posts...');
  await BlogPost.bulkCreate([
    { autor_id:admin.id, titulo:'¿Qué es el TEA? Guía completa para familias', slug:'que-es-el-tea-guia-completa', resumen:'El TEA es una condición del neurodesarrollo que afecta la comunicación e interacción social. Conozca todo lo que necesita saber como familia.', contenido:`El Trastorno del Espectro Autista (TEA) es una condición del neurodesarrollo que se caracteriza por diferencias en la comunicación social y patrones de conducta repetitivos o restringidos.\n\nCada persona con TEA es única. El espectro es amplio e incluye perfiles muy distintos: desde personas con alto nivel de funcionamiento hasta quienes necesitan apoyo significativo en su vida diaria.\n\nSignos tempranos que pueden indicar TEA:\n- Poco contacto visual\n- No señalar objetos de interés\n- Pérdida de habilidades del lenguaje previamente adquiridas\n- Intereses muy específicos e intensos\n- Sensibilidades sensoriales inusuales\n\nEl diagnóstico temprano y la intervención adecuada marcan una diferencia significativa en el desarrollo y calidad de vida de la persona con TEA y su familia.`, categoria:'guias', emoji:'🧩', color_fondo:'#EBF1FF', color_acento:'#4C7EF3', tiempo_lectura:'8 min', autor_nombre:'Equipo ConectaTEA', destacado:true, publicado:true, vistas:342 },

    { autor_id:ana.id, titulo:'10 estrategias visuales para usar en casa', slug:'10-estrategias-visuales-en-casa', resumen:'Los apoyos visuales son una de las herramientas más efectivas para niños con TEA. Aprende cómo implementarlos de forma sencilla en tu hogar.', contenido:`Los apoyos visuales reducen la ansiedad al hacer predecible el entorno. Aquí 10 estrategias:\n\n1. Tablero de rutina matutina con pictogramas\n2. Calendario visual semanal\n3. Reglas visuales del hogar\n4. Temporizadores visuales para anticipar cambios\n5. Mapa del hogar con etiquetas ilustradas\n6. Menú visual de comidas\n7. Sistema de elección con dos opciones visuales\n8. Zonas diferenciadas por color\n9. Guiones sociales ilustrados\n10. Libro "Sobre mí" con fotos y preferencias`, categoria:'tips', emoji:'👁️', color_fondo:'#E3F9F1', color_acento:'#2ECC8E', tiempo_lectura:'5 min', autor_nombre:'Ana Rodríguez — Terapeuta', publicado:true, vistas:218 },

    { autor_id:admin.id, titulo:'Investigación 2025: Avances en diagnóstico temprano de TEA', slug:'avances-diagnostico-temprano-tea-2025', resumen:'Un nuevo estudio revela que marcadores en bebés de 6-12 meses pueden predecir TEA con alta precisión, abriendo la puerta a intervenciones más tempranas.', contenido:`La investigación publicada en 2025 por el consorcio IBIS encontró que patrones de desarrollo cerebral observables en resonancias magnéticas a los 6 meses pueden identificar infantes en riesgo de TEA con una precisión del 87%.\n\nEsto permite intervenciones mucho más tempranas que las actuales, que típicamente ocurren entre los 2-4 años. La intervención temprana mejora significativamente el desarrollo del lenguaje, las habilidades sociales y la autonomía.`, categoria:'investigacion', emoji:'🔬', color_fondo:'#F0EBFF', color_acento:'#8B5CF6', tiempo_lectura:'10 min', autor_nombre:'Instituto Nacional de Neurodesarrollo', publicado:true, vistas:156 },

    { autor_id:admin.id, titulo:'Recursos gratuitos TEA en Colombia', slug:'recursos-gratuitos-tea-colombia', resumen:'Directorio actualizado de entidades públicas y privadas en Colombia que ofrecen servicios gratuitos o subsidiados para personas con TEA.', contenido:`Colombia cuenta con varias rutas de atención:\n\n**ICBF**: Atención integral a niños con discapacidad\n**EPS**: Terapias cubiertas por el sistema de salud\n**Secretaría de Educación**: Programas de inclusión escolar\n**Fundación Saldarriaga Concha**: Recursos y formación gratuita\n**SENA**: Programas de formación para familias\n\nPara acceder: solicite la valoración por medicina general en su EPS, que debe derivar a neuropediatría y desde allí se activa la ruta de atención integral.`, categoria:'recursos', emoji:'🇨🇴', color_fondo:'#E0F7F5', color_acento:'#14B8A6', tiempo_lectura:'6 min', autor_nombre:'Equipo ConectaTEA', publicado:true, vistas:287 },

    { autor_id:maria.id, titulo:'"Mi hijo me enseñó a ver el mundo diferente" — Historia de María', slug:'historia-maria-hijo-tea', resumen:'Cuando Carlos fue diagnosticado con TEA a los 3 años, el mundo de María se transformó. Cinco años después, comparte lo que esta experiencia les ha enseñado.', contenido:`Cuando el neuropediatra pronunció las siglas "TEA", mi mundo se detuvo por un momento. Carlos tenía 3 años y yo no sabía qué significaba eso para su futuro ni para el nuestro.\n\nHoy, cinco años después, puedo decir que el TEA nos ha enseñado más de lo que imaginábamos. Aprendimos a comunicarnos de formas nuevas, a celebrar cada pequeño logro, a encontrar comunidad con otras familias que viven lo mismo.\n\nCarlos hoy va al colegio regular con apoyo, ama los dinosaurios y los números, y nos llena de alegría cada día. No es el camino que imaginábamos, pero es nuestro camino y lo recorremos juntos.`, categoria:'historias', emoji:'❤️', color_fondo:'#FFF0F0', color_acento:'#FF6B6B', tiempo_lectura:'7 min', autor_nombre:'María García — Mamá de Carlos', publicado:true, destacado:true, vistas:523 },

    { autor_id:admin.id, titulo:'Las mejores apps de apoyo TEA en 2025', slug:'mejores-apps-apoyo-tea-2025', resumen:'Listado actualizado de aplicaciones móviles que han demostrado beneficios para personas con TEA en comunicación, habilidades sociales y regulación emocional.', contenido:`Las apps más recomendadas para 2025:\n\n**Comunicación AAC**: Proloquo2Go, LetMeTalk\n**Emociones**: Emotions and Feelings, Social Story\n**Rutinas**: Choiceworks, AutiPlan\n**Tiempo**: TimTimer, Time Timer\n**Educación**: ConectaTEA (¡somos nosotros! 😊)\n\nRecuerda que ninguna app reemplaza la terapia profesional, pero pueden ser excelentes complementos al trabajo terapéutico.`, categoria:'recursos', emoji:'📱', color_fondo:'#EBF1FF', color_acento:'#4C7EF3', tiempo_lectura:'4 min', autor_nombre:'Equipo ConectaTEA', publicado:true, vistas:198 },
  ]);
  console.log(`   ✓ 6 posts de blog`);

  // ════════════════════════════════════════
  //  13. CHAT MENSAJES
  // ════════════════════════════════════════
  console.log('💬 Creando mensajes de chat...');
  await ChatMensaje.bulkCreate([
    { usuario_id:maria.id,  canal:'general',      texto:'¡Hola a todos! ¿Alguien tiene tips para las crisis de la mañana antes del colegio?', autor_nombre:'María G.', autor_avatar:'👩', autor_rol:'padre' },
    { usuario_id:pedro.id,  canal:'general',      texto:'Nosotros usamos un tablero visual con los pasos de la mañana. ¡Ha funcionado increíble! Los pictogramas en la puerta del baño lo cambiaron todo 🌟', autor_nombre:'Pedro L.', autor_avatar:'👨', autor_rol:'padre' },
    { usuario_id:maria.id,  canal:'general',      texto:'¡Qué buena idea! ¿Los hicieron ustedes o los descargaron de algún lugar?', autor_nombre:'María G.', autor_avatar:'👩', autor_rol:'padre' },
    { usuario_id:pedro.id,  canal:'general',      texto:'Los encontramos en ConectaTEA 😄 En la sección de material educativo hay un set de pictogramas imprimibles muy completo.', autor_nombre:'Pedro L.', autor_avatar:'👨', autor_rol:'padre' },
    { usuario_id:maria.id,  canal:'experiencias', texto:'Quiero compartir algo que nos cambió la vida: cuando Carlos aprendió a usar el tablero de comunicación AAC, dejó de tener crisis de frustración. Ahora puede expresar lo que necesita aunque no encuentre las palabras. 💙', autor_nombre:'María G.', autor_avatar:'👩', autor_rol:'padre', es_experiencia:true },
    { usuario_id:pedro.id,  canal:'experiencias', texto:'Totalmente de acuerdo con María. Sofía también mejoró muchísimo con los pictogramas. Lo más difícil fue el primer mes de constancia, pero valió completamente la pena.', autor_nombre:'Pedro L.', autor_avatar:'👨', autor_rol:'padre', es_experiencia:true },
    { usuario_id:maria.id,  canal:'preguntas',    texto:'¿Alguien sabe cómo manejar la selectividad alimentaria? Carlos solo acepta 6 alimentos y estamos muy preocupados.', autor_nombre:'María G.', autor_avatar:'👩', autor_rol:'padre' },
    { usuario_id:pedro.id,  canal:'preguntas',    texto:'Eso es muy común en TEA. Nosotros trabajamos con una terapeuta ocupacional especializada en integración sensorial y en 3 meses Sofía amplió su dieta. Te recomiendo buscar una TO, hace milagros 🙌', autor_nombre:'Pedro L.', autor_avatar:'👨', autor_rol:'padre' },
  ]);
  console.log(`   ✓ 8 mensajes de chat`);

  // ════════════════════════════════════════
  //  14. MATERIAL EDUCATIVO
  // ════════════════════════════════════════
  console.log('📂 Creando material educativo...');
  await Material.bulkCreate([
    { autor_id:ana.id,   titulo:'Fichas de emociones TEA Nivel 1',          descripcion:'Set de 12 fichas imprimibles para trabajar el reconocimiento de emociones básicas en niños con TEA niveles 1 y 2.', tipo:'fichas',      area:'percepcion',  nivel:'basico',      formato:'PDF', emoji:'😊', color_fondo:'#EBF1FF', descargas:142, acceso:'todos' },
    { autor_id:ana.id,   titulo:'Guía de pictogramas para casa',             descripcion:'Manual completo para padres sobre cómo implementar pictogramas en el hogar. Incluye estrategias y ejemplos prácticos.', tipo:'guias', area:'todas', nivel:'todas', formato:'PDF', emoji:'💬', color_fondo:'#E3F9F1', descargas:98, acceso:'todos' },
    { autor_id:laura.id, titulo:'Set de 200 pictogramas básicos',            descripcion:'Colección completa de pictogramas en alta resolución para imprimir y plastificar. Incluye categorías: necesidades, emociones, lugares, familia.', tipo:'pictogramas', area:'todas', nivel:'todas', formato:'ZIP', emoji:'🖼️', color_fondo:'#FFF6E8', descargas:315, acceso:'todos' },
    { autor_id:ana.id,   titulo:'Rutinas visuales imprimibles A4',           descripcion:'4 rutinas completas (mañana, noche, colegio, baño) en formato imprimible con pictogramas y espacio para personalizar.', tipo:'fichas', area:'vida_diaria', nivel:'basico', formato:'PDF', emoji:'📅', color_fondo:'#E0F7F5', descargas:267, acceso:'todos' },
    { autor_id:laura.id, titulo:'Cuentos sociales adaptados para TEA',       descripcion:'5 cuentos sociales sobre situaciones comunes: ir al médico, cambio de rutina, hacer amigos, resolver conflictos.', tipo:'guias', area:'social', nivel:'basico', formato:'PDF', emoji:'📚', color_fondo:'#F0EBFF', descargas:189, acceso:'todos' },
    { autor_id:ana.id,   titulo:'Evaluación de habilidades cognitivas TEA',  descripcion:'Protocolo de evaluación estandarizado para valorar atención, memoria y funciones ejecutivas. Incluye normas de interpretación.', tipo:'evaluaciones', area:'cognitiva', nivel:'todas', formato:'DOCX', emoji:'📝', color_fondo:'#FFF0EC', descargas:76, acceso:'profesionales' },
    { autor_id:laura.id, titulo:'Estrategias sensoriales en el aula — Guía docente', descripcion:'Guía práctica para docentes: cómo adaptar el aula, manejar crisis sensoriales y crear un ambiente inclusivo para estudiantes con TEA.', tipo:'guias', area:'percepcion', nivel:'todas', formato:'PDF', emoji:'🏫', color_fondo:'#EBF1FF', descargas:203, acceso:'todos' },
    { autor_id:ana.id,   titulo:'Tableros de comunicación AAC imprimibles',  descripcion:'Tableros en formato A4 y A3 para comunicación aumentativa. Incluye tablero de necesidades básicas, emociones y actividades.', tipo:'pictogramas', area:'lenguaje', nivel:'basico', formato:'PDF', emoji:'💬', color_fondo:'#E3F9F1', descargas:178, acceso:'todos' },
  ]);
  console.log(`   ✓ 8 materiales educativos`);

  // ════════════════════════════════════════
  //  15. INFORMES
  // ════════════════════════════════════════
  console.log('📋 Creando informes de ejemplo...');
  await Informe.bulkCreate([
    {
      nino_id:carlos_u.id, autor_id:ana.id,
      titulo:'Informe de progreso — Semana 4-8 de marzo 2025',
      tipo:'progreso', periodo:'Semana del 4 al 8 de marzo de 2025',
      areas_evaluadas: JSON.stringify(['percepcion','cognitiva','lenguaje','social']),
      logros:'Carlos completó 8 actividades esta semana con un promedio de 87% de aciertos. Mayor logro: reconocimiento de emociones complejas (frustración y nerviosismo) con 90% de precisión. Mejoró en turnos de conversación durante las sesiones grupales.',
      dificultades:'Continúa presentando dificultades en habilidades sociales con pares desconocidos. La transición entre actividades sigue generando algo de resistencia.',
      recomendaciones:'Practicar en casa el juego de "esperar el turno" con juegos de mesa simples. Continuar usando el tablero de comunicación AAC especialmente en momentos de frustración. Mantener la rutina visual de la mañana.',
      objetivos:'Objetivo 1: Ampliar el vocabulario emocional a 8 emociones identificadas correctamente. Objetivo 2: Participar en 2 interacciones sociales espontáneas por semana. Objetivo 3: Completar la rutina matutina con independencia en 5 de 7 pasos.',
      datos_progreso: JSON.stringify({ percepcion:72, cognitiva:80, lenguaje:60, lectomatem:75, social:45, vida_diaria:85 }),
      visible_para_familia:true, enviado_familia:true, borrador:false,
      fecha_informe: new Date('2025-03-08'),
    },
    {
      nino_id:carlos_u.id, autor_id:ana.id,
      titulo:'Observación: Sensibilidad auditiva en recreo',
      tipo:'observacion', periodo:'5 de marzo de 2025',
      areas_evaluadas: JSON.stringify(['percepcion']),
      logros:'Carlos logró verbalizar su malestar antes de llegar al punto de crisis.',
      dificultades:'El día 5 de marzo Carlos presentó respuesta de estrés ante los ruidos del recreo (patio con eco). Necesitó 8 minutos en la zona de calma para regularse.',
      recomendaciones:'Se recomienda: (1) Auriculares reductores de ruido para el recreo. (2) Permiso para salir 2 minutos antes al recreo para evitar la aglomeración de ruido. (3) Identificar un adulto de confianza en el patio.',
      observaciones:'La respuesta fue adecuada una vez activado el protocolo. La estrategia de la pelota sensorial funcionó bien para la regulación.',
      datos_progreso: JSON.stringify({}),
      visible_para_familia:true, enviado_familia:true, borrador:false,
      fecha_informe: new Date('2025-03-05'),
    },
    {
      nino_id:carlos_u.id, autor_id:ana.id,
      titulo:'Plan de trabajo — Marzo 2025',
      tipo:'plan_trabajo', periodo:'Mes de marzo 2025',
      areas_evaluadas: JSON.stringify(['cognitiva','lenguaje','social']),
      logros:'Carlos muestra motivación alta por las actividades de dinosaurios y matemáticas.',
      objetivos:'Área cognitiva: Trabajar memoria secuencial con series de 4 elementos. Área lenguaje: Incorporar frases de 4-5 palabras en comunicación espontánea. Área social: Practicar presentarse a compañeros nuevos con guión social.',
      recomendaciones:'Continuar con 2 sesiones semanales de 45 minutos. Incorporar los intereses de Carlos (dinosaurios) en todas las actividades posibles para maximizar motivación.',
      datos_progreso: JSON.stringify({}),
      visible_para_familia:true, enviado_familia:false, borrador:false,
      fecha_informe: new Date('2025-03-01'),
    },
  ]);
  console.log(`   ✓ 3 informes`);

  // ════════════════════════════════════════
  //  16. RED DE APOYO
  // ════════════════════════════════════════
  console.log('🌐 Creando red de apoyo...');
  await RedApoyo.bulkCreate([
    { nombre:'Centro de Neurodesarrollo TEA Bogotá', tipo:'institucion', descripcion:'Centro especializado con diagnóstico, terapia ABA, fonoaudiología y psicología. Atención desde los 18 meses hasta la adultez.', especialidades: JSON.stringify(['Diagnóstico TEA','Terapia ABA','Fonoaudiología','Psicología clínica']), ciudad:'Bogotá', departamento:'Cundinamarca', telefono:'+57 1 234 5678', email:'info@teatbogota.org', sitio_web:'www.teatbogota.org', atiende_virtual:true, atiende_presencial:true, cubre_eps:false, emoji:'🏛️', color_tipo:'#4C7EF3', color_fondo:'#EBF1FF', verified:true, activo:true, calificacion:4.8, num_resenas:47 },
    { nombre:'Psic. Ana Rodríguez — Especialista TEA', tipo:'psicologo', descripcion:'Psicóloga clínica con 10 años de experiencia en diagnóstico y acompañamiento TEA. Enfoque cognitivo-conductual y manejo de conducta.', especialidades: JSON.stringify(['Diagnóstico psicológico','Habilidades sociales','Manejo de conducta','Orientación familiar']), ciudad:'Medellín', departamento:'Antioquia', telefono:'+57 312 456 7890', atiende_virtual:true, atiende_presencial:true, cubre_eps:true, emoji:'🧠', color_tipo:'#8B5CF6', color_fondo:'#F0EBFF', verified:true, activo:true, calificacion:4.9, num_resenas:31 },
    { nombre:'Fundación Saldarriaga Concha', tipo:'fundacion', descripcion:'Fundación colombiana líder en inclusión de personas con discapacidad. Ofrece recursos gratuitos, formación a familias y asesoría en inclusión escolar.', especialidades: JSON.stringify(['Inclusión educativa','Orientación familiar','Formación docente','Investigación']), ciudad:'Bogotá', departamento:'Cundinamarca', telefono:'+57 1 745 5555', sitio_web:'www.saldarriagaconcha.org', atiende_virtual:true, atiende_presencial:true, cubre_eps:false, emoji:'❤️', color_tipo:'#FF6B6B', color_fondo:'#FFF0F0', verified:true, activo:true, calificacion:4.7, num_resenas:89 },
    { nombre:'Colegio Nuevo Horizonte — Programa TEA', tipo:'colegio', descripcion:'Institución educativa con programa de inclusión para niños con TEA, docentes especializados y adaptaciones curriculares individualizadas.', especialidades: JSON.stringify(['Inclusión escolar','Adaptaciones curriculares','Aula de apoyo','Formación docente']), ciudad:'Bogotá', departamento:'Cundinamarca', telefono:'+57 1 876 5432', atiende_virtual:false, atiende_presencial:true, cubre_eps:false, emoji:'🏫', color_tipo:'#2ECC8E', color_fondo:'#E3F9F1', verified:true, activo:true, calificacion:4.5, num_resenas:23 },
    { nombre:'T.O. Luis Mora — Integración Sensorial', tipo:'terapeuta', descripcion:'Terapeuta Ocupacional especializado en integración sensorial para TEA. Evaluación y tratamiento de disfunciones sensoriales que afectan el aprendizaje.', especialidades: JSON.stringify(['Integración sensorial','Habilidades motoras','Actividades de la vida diaria','Adaptaciones escolares']), ciudad:'Cali', departamento:'Valle del Cauca', telefono:'+57 320 987 6543', atiende_virtual:true, atiende_presencial:true, cubre_eps:true, emoji:'🧑‍⚕️', color_tipo:'#FFB347', color_fondo:'#FFF6E8', verified:false, activo:true, calificacion:4.6, num_resenas:18 },
    { nombre:'Dra. Patricia Vásquez — Neuropediatría', tipo:'medico', descripcion:'Neuropediatra con especialización en TEA y TDAH. Diagnóstico clínico, manejo farmacológico cuando necesario y coordinación con equipo terapéutico.', especialidades: JSON.stringify(['Diagnóstico neurológico','Evaluación del desarrollo','TEA y TDAH','Manejo farmacológico']), ciudad:'Barranquilla', departamento:'Atlántico', telefono:'+57 5 678 9012', atiende_virtual:true, atiende_presencial:true, cubre_eps:true, emoji:'👨‍⚕️', color_tipo:'#14B8A6', color_fondo:'#E0F7F5', verified:true, activo:true, calificacion:4.9, num_resenas:62 },
    { nombre:'Federación Colombiana de Autismo', tipo:'institucion', descripcion:'Organización nacional que agremia a familias y profesionales. Organiza eventos, formación continua y defensa de derechos de personas con TEA.', especialidades: JSON.stringify(['Defensa de derechos','Formación familias','Eventos','Investigación']), ciudad:'Bogotá', departamento:'Cundinamarca', sitio_web:'www.autismocolombia.org', atiende_virtual:true, atiende_presencial:true, cubre_eps:false, emoji:'🌐', color_tipo:'#4C7EF3', color_fondo:'#EBF1FF', verified:true, activo:true, calificacion:4.6, num_resenas:54 },
    { nombre:'T.O. Carolina Reyes — Terapia ABA', tipo:'terapeuta', descripcion:'Especialista en Análisis Aplicado del Comportamiento (ABA) para TEA. Programas individualizados basados en evidencia científica para niños 2-12 años.', especialidades: JSON.stringify(['Terapia ABA','Habilidades sociales','Reducción de conductas problemáticas','Comunicación funcional']), ciudad:'Bogotá', departamento:'Cundinamarca', telefono:'+57 315 234 5678', atiende_virtual:false, atiende_presencial:true, cubre_eps:true, emoji:'🧑‍⚕️', color_tipo:'#FFB347', color_fondo:'#FFF6E8', verified:true, activo:true, calificacion:4.8, num_resenas:29 },
  ]);
  console.log(`   ✓ 8 recursos en red de apoyo`);

  // ════════════════════════════════════════
  //  17. NOTIFICACIONES
  // ════════════════════════════════════════
  console.log('🔔 Creando notificaciones...');
  await Notificacion.bulkCreate([
    { usuario_id:maria.id,  tipo:'logro',        titulo:'¡Carlos obtuvo un nuevo logro! ⭐',            mensaje:'Carlos completó su primera actividad y obtuvo "Primera estrella"', emoji:'⭐', color_fondo:'#FFF6E8', leida:false },
    { usuario_id:maria.id,  tipo:'informe',      titulo:'Nuevo informe disponible',                     mensaje:'Ana Rodríguez publicó el informe de progreso de la semana del 4-8 de marzo', emoji:'📋', color_fondo:'#E3F9F1', leida:false },
    { usuario_id:maria.id,  tipo:'mensaje',      titulo:'Nuevo mensaje de Ana Rodríguez',               mensaje:'Hola María, quería contarte sobre el avance de esta semana…', emoji:'💬', color_fondo:'#EBF1FF', leida:true },
    { usuario_id:maria.id,  tipo:'recordatorio', titulo:'Recordatorio: Rutina de la noche',             mensaje:'En 30 minutos comienza la rutina de la noche de Carlos', emoji:'🌙', color_fondo:'#F0EBFF', leida:true },
    { usuario_id:ana.id,    tipo:'sistema',      titulo:'Bienvenida a ConectaTEA 🧩',                   mensaje:'Hola Ana, tu cuenta como terapeuta está activa. ¡Empieza agregando a tus pacientes!', emoji:'🧩', color_fondo:'#EBF1FF', leida:false },
    { usuario_id:carlos_u.id, tipo:'logro',      titulo:'¡Nuevo logro! Explorador curioso 🔍',          mensaje:'¡Completaste 5 actividades diferentes! ¡Eres increíble!', emoji:'🔍', color_fondo:'#EBF1FF', leida:false },
    { usuario_id:carlos_u.id, tipo:'sistema',    titulo:'¡5 días seguidos! 🔥',                         mensaje:'¡Llevas 5 días practicando sin parar! ¡Sigue así, campeón!', emoji:'🔥', color_fondo:'#FFF0F0', leida:false },
  ]);
  console.log(`   ✓ 7 notificaciones`);

  // ════════════════════════════════════════
  //  VIDEOS YOUTUBE — ¡A Divertirnos! (v6)
  // ════════════════════════════════════════
  console.log('📺 Creando videos de YouTube...');
  await Video.bulkCreate([
    // 🎵 CANCIONES
    { youtube_id:'CJZNGbjkvik', titulo:'Las Vocales — Canción Infantil',        subtitulo:'A, E, I, O, U con letra y música',               categoria:'canciones',  duracion:'3:12', duracion_seg:192, edad_min:3, edad_max:10, color_fondo:'#EBF1FF', nuevo:true,  destacado:true,  apto_tea:true },
    { youtube_id:'U1cB3nDHVoI', titulo:'El Abecedario — Canción para niños',    subtitulo:'Aprende las letras cantando',                    categoria:'canciones',  duracion:'4:05', duracion_seg:245, edad_min:3, edad_max:10, color_fondo:'#E3F9F1', nuevo:false, destacado:true,  apto_tea:true },
    { youtube_id:'Uq1fFQBJHAY', titulo:'Los Colores — Canción y Baile',         subtitulo:'Aprende los colores con movimiento',             categoria:'canciones',  duracion:'3:48', duracion_seg:228, edad_min:3, edad_max:8,  color_fondo:'#FFF6E8', nuevo:false, destacado:false, apto_tea:true },
    { youtube_id:'9i6rk6T8gPU', titulo:'Los Números del 1 al 10',               subtitulo:'Canción para contar y aprender números',         categoria:'canciones',  duracion:'3:22', duracion_seg:202, edad_min:3, edad_max:8,  color_fondo:'#FFF0F0', nuevo:true,  destacado:false, apto_tea:true },
    { youtube_id:'IHZBJqQqpxc', titulo:'Las Emociones — Canción TEA',           subtitulo:'Identificar cómo nos sentimos',                  categoria:'canciones',  duracion:'2:58', duracion_seg:178, edad_min:4, edad_max:12, color_fondo:'#F0EBFF', nuevo:false, destacado:true,  apto_tea:true },
    { youtube_id:'MFNsEi8RSmg', titulo:'Buenos Días — Rutina de la Mañana',    subtitulo:'Canciones para empezar el día',                  categoria:'canciones',  duracion:'4:15', duracion_seg:255, edad_min:3, edad_max:10, color_fondo:'#E3F9F1', nuevo:false, destacado:false, apto_tea:true },
    // 📖 CUENTOS
    { youtube_id:'tHFhEEZqLWg', titulo:'Los Tres Cerditos',                     subtitulo:'Cuento clásico animado en español',              categoria:'cuentos',    duracion:'8:30', duracion_seg:510, edad_min:4, edad_max:10, color_fondo:'#FFF6E8', nuevo:false, destacado:true,  apto_tea:true },
    { youtube_id:'WU2UcJICQJ8', titulo:'Caperucita Roja Animada',               subtitulo:'El cuento clásico con imágenes claras',          categoria:'cuentos',    duracion:'9:15', duracion_seg:555, edad_min:4, edad_max:10, color_fondo:'#FFF0F0', nuevo:false, destacado:false, apto_tea:true },
    { youtube_id:'PFJKABwlDX4', titulo:'El Patito Feo — Cuento Animado',        subtitulo:'Historia de aceptación y amor propio',           categoria:'cuentos',    duracion:'7:45', duracion_seg:465, edad_min:4, edad_max:10, color_fondo:'#EBF1FF', nuevo:true,  destacado:true,  apto_tea:true },
    { youtube_id:'s8FXGVaNsUA', titulo:'Pinocho — Cuento Corto',                subtitulo:'Cuento sobre la honestidad',                     categoria:'cuentos',    duracion:'11:20',duracion_seg:680, edad_min:5, edad_max:12, color_fondo:'#E3F9F1', nuevo:false, destacado:false, apto_tea:true },
    // 😊 EMOCIONES
    { youtube_id:'uNw5Qe-XKGY', titulo:'¿Cómo me siento hoy?',                 subtitulo:'Reconocer y expresar emociones',                 categoria:'emociones',  duracion:'5:40', duracion_seg:340, edad_min:4, edad_max:12, color_fondo:'#F0EBFF', nuevo:true,  destacado:true,  apto_tea:true },
    { youtube_id:'XGMgOgGf4HQ', titulo:'Manejar la Rabia — Para niños',         subtitulo:'Estrategias para calmarse',                      categoria:'emociones',  duracion:'6:10', duracion_seg:370, edad_min:5, edad_max:12, color_fondo:'#FFF0F0', nuevo:false, destacado:true,  apto_tea:true },
    { youtube_id:'cGKvJzTpiFQ', titulo:'La Empatía — Cuento Animado',           subtitulo:'Aprender a entender a los demás',                categoria:'emociones',  duracion:'4:55', duracion_seg:295, edad_min:4, edad_max:12, color_fondo:'#FFF6E8', nuevo:false, destacado:false, apto_tea:true },
    // 🌿 NATURALEZA
    { youtube_id:'TYrMBgCk40E', titulo:'Los Animales de la Granja',             subtitulo:'Conoce vacas, gallinas y más animales',          categoria:'naturaleza', duracion:'5:18', duracion_seg:318, edad_min:3, edad_max:10, color_fondo:'#E3F9F1', nuevo:false, destacado:true,  apto_tea:true },
    { youtube_id:'0_Yp5fBjjlw', titulo:'¿Por qué llueve? — Ciencia para niños',subtitulo:'El ciclo del agua explicado fácil',               categoria:'naturaleza', duracion:'4:42', duracion_seg:282, edad_min:5, edad_max:12, color_fondo:'#EBF1FF', nuevo:false, destacado:false, apto_tea:true },
    { youtube_id:'R7nxrUMhPrA', titulo:'Las Estaciones del Año',                subtitulo:'Primavera, verano, otoño e invierno',            categoria:'naturaleza', duracion:'5:02', duracion_seg:302, edad_min:4, edad_max:10, color_fondo:'#FFF6E8', nuevo:true,  destacado:false, apto_tea:true },
    { youtube_id:'U7rHMXD0sO0', titulo:'Los Insectos — Mariposas y Abejas',     subtitulo:'Conoce los insectos del jardín',                 categoria:'naturaleza', duracion:'6:15', duracion_seg:375, edad_min:4, edad_max:12, color_fondo:'#F0EBFF', nuevo:false, destacado:false, apto_tea:true },
    // 🎓 APRENDIZAJE
    { youtube_id:'JH-mCHRvVQE', titulo:'Las Formas Geométricas',               subtitulo:'Círculo, cuadrado, triángulo y más',             categoria:'aprendizaje',duracion:'4:20', duracion_seg:260, edad_min:3, edad_max:8,  color_fondo:'#EBF1FF', nuevo:false, destacado:true,  apto_tea:true },
    { youtube_id:'fEvM-OUbaFs', titulo:'Los Colores Primarios',                 subtitulo:'Aprende a mezclar colores',                      categoria:'aprendizaje',duracion:'3:55', duracion_seg:235, edad_min:3, edad_max:8,  color_fondo:'#FFF0F0', nuevo:false, destacado:false, apto_tea:true },
    { youtube_id:'p6BPJjRqMxw', titulo:'Las Partes del Cuerpo',                subtitulo:'Cabeza, hombros, rodillas y pies',               categoria:'aprendizaje',duracion:'3:10', duracion_seg:190, edad_min:3, edad_max:8,  color_fondo:'#E3F9F1', nuevo:true,  destacado:false, apto_tea:true },
    { youtube_id:'2-XVHpqj4TE', titulo:'Los Días de la Semana',                subtitulo:'Lunes, martes... ¡a memorizar!',                 categoria:'aprendizaje',duracion:'3:35', duracion_seg:215, edad_min:4, edad_max:10, color_fondo:'#F0EBFF', nuevo:false, destacado:false, apto_tea:true },
    // 🌊 RELAJACIÓN
    { youtube_id:'l0U00sEhc6I', titulo:'Zona de Calma — Relajación TEA',        subtitulo:'Técnicas para calmarse en momentos difíciles',   categoria:'relajacion', duracion:'7:30', duracion_seg:450, edad_min:4, edad_max:12, color_fondo:'#E3F9F1', nuevo:true,  destacado:true,  apto_tea:true },
    { youtube_id:'dXdV1DXqJL8', titulo:'Respiración para Niños — Calma',        subtitulo:'Técnica de la mariposa para calmarse',           categoria:'relajacion', duracion:'5:50', duracion_seg:350, edad_min:3, edad_max:12, color_fondo:'#EBF1FF', nuevo:false, destacado:true,  apto_tea:true },
    { youtube_id:'fDdRMBxBFIo', titulo:'Música Tranquila para TEA',             subtitulo:'Sonidos suaves para momentos difíciles',         categoria:'relajacion', duracion:'30:00',duracion_seg:1800,edad_min:3, edad_max:18, color_fondo:'#F0EBFF', nuevo:false, destacado:true,  apto_tea:true },
    { youtube_id:'nKUf1PqxCPs', titulo:'Yoga para Niños — 10 minutos',          subtitulo:'Estiramientos y respiración divertida',          categoria:'relajacion', duracion:'10:15',duracion_seg:615, edad_min:4, edad_max:12, color_fondo:'#FFF6E8', nuevo:true,  destacado:false, apto_tea:true },
  ]);
  console.log(`   ✓ 25 videos de YouTube`);

  // ════════════════════════════════════════
  //  FIN
  // ════════════════════════════════════════
  console.log('\n✅ ═══════════════════════════════════════');
  console.log('   SEED COMPLETADO — ConectaTEA v6');
  console.log('═══════════════════════════════════════\n');
  console.log('📧 Credenciales de acceso demo:');
  console.log('   Admin:     admin@conectatea.app    / Test1234!');
  console.log('   Familia:   maria@familia.com       / Test1234!');
  console.log('   Terapeuta: ana@terapeuta.com       / Test1234!');
  console.log('   Docente:   laura@colegio.edu       / Test1234!');
  console.log('   Niños entran sin credenciales (acceso directo)\n');

  await sequelize.close();
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Error en seed:', err);
  process.exit(1);
});
