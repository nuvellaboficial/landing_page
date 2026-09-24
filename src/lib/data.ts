/** Landing content. Everything the visitor reads lives here, separated from layout and behavior. */

export const WHATSAPP_DEMO_URL =
  'https://wa.me/573178605783?text=Hola%2C%20quiero%20agendar%20una%20demo%20de%20NuvelLab';
export const WHATSAPP_CONTACT_URL = 'https://wa.me/573178605783';
export const WHATSAPP_DISPLAY = '+57 317 860 5783';
export const APP_URL = 'https://app.nuvellab.cloud';
/** src/pages/politica-de-tratamiento-de-datos.astro (moved from GitHub Pages). */
export const PRIVACY_POLICY_URL = '/politica-de-tratamiento-de-datos';

export const NAV_LINKS = [
  { label: 'CÓMO FUNCIONA', href: '#como-funciona' },
  { label: 'EL BOT', href: '#el-bot' },
  { label: 'TU PANEL', href: '#tu-panel' },
  { label: 'NEGOCIOS', href: '#negocios' },
  { label: 'PREGUNTAS', href: '#preguntas' },
] as const;

/** A chat script line: client, bot, system notice, typing indicator or receipt image. */
export type ChatLine =
  | readonly ['c' | 'b', string, string]
  | readonly ['sys', string]
  | readonly ['typing']
  | readonly ['img'];

/** A booked block in the agenda: [workerColumn, hourOffset, durationHours, client, service]. */
export type BusyBlock = readonly [number, number, number, string, string];

export interface Niche {
  tab: string;
  biz: string;
  bizInitials: string;
  client: string;
  service: string;
  price: string;
  hour: number;
  durationH: number;
  column: number;
  date: string;
  workers: readonly string[];
  /** Client, bot, client, bot. Typing indicators are inserted by `nicheScript`. */
  msgs: readonly [ChatLine, ChatLine, ChatLine, ChatLine];
  busy: readonly BusyBlock[];
  services: readonly (readonly [string, string, string])[];
}

export const NICHES: readonly Niche[] = [
  {
    tab: 'Spas', biz: 'Spa Aurora', bizInitials: 'SA', client: 'Laura Restrepo', service: 'Masaje relajante',
    price: '$85.000', hour: 15, durationH: 1, column: 0, date: 'Viernes, 25 de septiembre',
    workers: ['Camila Ortiz', 'Sara Londoño', 'Paula Vélez'],
    msgs: [
      ['c', 'Hola, ¿tienen cita mañana a las 3?', '9:41 p. m.'],
      ['b', '¡Hola Laura! Mañana tenemos libre a las 2:00, 3:00 y 4:30 p. m. ¿Cuál te sirve?', '9:41 p. m.'],
      ['c', 'La de las 3 porfa, masaje relajante 🙏', '9:42 p. m.'],
      ['b', 'Listo Laura, quedaste agendada mañana a las 3:00 p. m. para Masaje relajante con Camila.', '9:42 p. m.'],
    ],
    busy: [
      [0, -2, 1, 'Mariana Ríos', 'Facial hidratante'],
      [1, -1, 1.5, 'Juliana Toro', 'Masaje con piedras'],
      [2, 0.5, 1, 'Natalia Gil', 'Exfoliación corporal'],
      [0, 1.5, 1, 'Isabel Duque', 'Masaje relajante'],
    ],
    services: [
      ['Masaje relajante', '60 minutos', '$85.000'],
      ['Facial hidratante', '45 minutos', '$70.000'],
      ['Exfoliación corporal', '50 minutos', '$95.000'],
    ],
  },
  {
    tab: 'Barberías', biz: 'Barbería Distrito', bizInitials: 'BD', client: 'Andrés Gómez', service: 'Corte + barba',
    price: '$35.000', hour: 17, durationH: 0.75, column: 1, date: 'Jueves, 24 de septiembre',
    workers: ['Mateo Rojas', 'Julián Castaño', 'Kevin Arango'],
    msgs: [
      ['c', 'Buenas, ¿me pueden atender hoy para corte y barba?', '1:15 p. m.'],
      ['b', '¡Hola Andrés! Hoy Julián tiene libre a las 4:30, 5:00 y 6:00 p. m.', '1:15 p. m.'],
      ['c', 'A las 5 me queda perfecto', '1:16 p. m.'],
      ['b', 'Listo Andrés, quedaste agendado hoy a las 5:00 p. m. para Corte + barba con Julián.', '1:16 p. m.'],
    ],
    busy: [
      [0, -1.5, 0.5, 'Santiago Mora', 'Corte clásico'],
      [1, -1, 0.75, 'Felipe Niño', 'Corte + barba'],
      [2, 0, 1, 'Juan Pablo Ríos', 'Corte + diseño'],
      [1, 1.5, 0.5, 'Cristian López', 'Arreglo de barba'],
    ],
    services: [
      ['Corte + barba', '45 minutos', '$35.000'],
      ['Corte clásico', '30 minutos', '$25.000'],
      ['Arreglo de barba', '20 minutos', '$15.000'],
    ],
  },
  {
    tab: 'Peluquerías caninas', biz: 'Patitas Spa Canino', bizInitials: 'PS', client: 'Luna · Daniela Muñoz',
    service: 'Baño y corte raza mediana', price: '$60.000', hour: 10, durationH: 1.5, column: 2,
    date: 'Sábado, 26 de septiembre',
    workers: ['Tomás Ruiz', 'Laura Cano', 'Valentina Herrera'],
    msgs: [
      ['c', 'Hola, ¿tienen espacio el sábado para bañar y motilar a Luna? 🐶', '7:58 a. m.'],
      ['b', '¡Hola Daniela! El sábado tenemos libre a las 9:00, 10:00 y 11:30 a. m.', '7:58 a. m.'],
      ['c', 'A las 10 porfa', '7:59 a. m.'],
      ['b', 'Listo Daniela, Luna quedó agendada el sábado a las 10:00 a. m. para Baño y corte raza mediana con Valentina.', '7:59 a. m.'],
    ],
    busy: [
      [0, -2, 1, 'Kira', 'Baño raza pequeña'],
      [1, -1, 1.5, 'Rocco', 'Baño y corte'],
      [2, -2, 1.5, 'Toby', 'Deslanado'],
      [0, 1, 1, 'Max', 'Corte de uñas'],
    ],
    services: [
      ['Baño y corte raza mediana', '90 minutos', '$60.000'],
      ['Baño raza pequeña', '60 minutos', '$40.000'],
      ['Corte de uñas', '15 minutos', '$15.000'],
    ],
  },
  {
    tab: 'Clínicas', biz: 'Clínica Dermavida', bizInitials: 'CD', client: 'Carlos Mejía', service: 'Valoración inicial',
    price: '$80.000', hour: 16, durationH: 0.5, column: 0, date: 'Jueves, 1 de octubre',
    workers: ['Dra. Natalia Ortiz', 'Dr. Felipe Salazar', 'Dra. Ana Cárdenas'],
    msgs: [
      ['c', 'Buenas tardes, quiero una valoración. ¿Hay algo el jueves?', '5:20 p. m.'],
      ['b', '¡Hola Carlos! El jueves hay espacio a las 8:00 a. m., 11:00 a. m. y 4:00 p. m.', '5:20 p. m.'],
      ['c', 'A las 4 p. m.', '5:21 p. m.'],
      ['b', 'Listo Carlos, quedaste agendado el jueves a las 4:00 p. m. para Valoración inicial con la Dra. Ortiz.', '5:21 p. m.'],
    ],
    busy: [
      [0, -1.5, 1, 'Marta Cifuentes', 'Limpieza facial'],
      [1, -1, 0.5, 'Jorge Pineda', 'Control'],
      [2, 0, 1, 'Lucía Arango', 'Limpieza facial profunda'],
      [1, 0.5, 0.5, 'Ana María Soto', 'Valoración inicial'],
    ],
    services: [
      ['Valoración inicial', '30 minutos', '$80.000'],
      ['Limpieza facial profunda', '60 minutos', '$120.000'],
      ['Control', '20 minutos', '$50.000'],
    ],
  },
];

/** "Cómo funciona" uses the spa, with a different client and slot. */
export const HOW_NICHE: Niche = {
  ...NICHES[0],
  client: 'Daniela Muñoz',
  hour: 14,
  date: 'Sábado, 26 de septiembre',
};

export const HOW_SCRIPT: readonly ChatLine[] = [
  ['c', 'Hola, ¿me puedes agendar un masaje para el sábado?', '11:48 p. m.'],
  ['typing'],
  ['b', 'Hola Daniela. El sábado Camila tiene libre a las 10:00 a. m. y a las 2:00 p. m.', '11:48 p. m.'],
  ['c', 'A las 2 porfa 🙏', '11:49 p. m.'],
  ['typing'],
  ['b', 'Listo Daniela, quedaste agendada el sábado a las 2:00 p. m. para Masaje relajante con Camila. Valor: $85.000.', '11:49 p. m.'],
];
/** Scroll progress at which each line of HOW_SCRIPT appears. */
export const HOW_THRESHOLDS = [0.04, 0.16, 0.26, 0.4, 0.5, 0.58] as const;

export const HOW_STEPS = [
  ['Tu cliente escribe cuando quiera.', 'De día, de noche o en festivo.'],
  ['El bot revisa tu agenda real y agenda.', 'Solo ofrece horarios en los que el trabajador está libre.'],
  ['La cita aparece en tu panel.', 'Con el cliente, el servicio, el trabajador y el precio.'],
] as const;

/** [name, message, time] */
export const NOTIFICATIONS = [
  ['Valentina', '¿Hay cupo hoy?', '11:02 p. m.'],
  ['Juan Pablo', '¿Cuánto vale el corte?', '11:02 p. m.'],
  ['Laura R.', 'Necesito mover mi cita del jueves', '11:03 p. m.'],
  ['Sofía', 'Holaaa ¿siguen abiertos?', '11:03 p. m.'],
  ['Diego A.', '¿Atienden domingos?', '11:03 p. m.'],
  ['Mariana', '¿Tienen algo a las 6?', '11:03 p. m.'],
  ['Carlos M.', 'Buenas, ¿cuánto dura el masaje?', '11:04 p. m.'],
  ['Paula', '¿Me pueden atender ya?', '11:04 p. m.'],
  ['Andrés G.', 'Quiero cancelar lo de mañana 😕', '11:04 p. m.'],
  ['Natalia', '¿Dónde quedan?', '11:04 p. m.'],
  ['Felipe', '¿El sábado hay espacio?', '11:04 p. m.'],
  ['Isabel', 'Hola??', '11:04 p. m.'],
  ['Tomás', '¿Todavía hay cita para hoy?', '11:04 p. m.'],
  ['Camilo', '¿Hacen facial?', '11:04 p. m.'],
] as const;

export interface BentoCard {
  title: string;
  sub: string;
  biz: string;
  bizInitials: string;
  script: readonly ChatLine[];
}

export const BENTO: readonly BentoCard[] = [
  {
    title: 'Agenda, cancela y reagenda.',
    sub: 'Tu cliente pide mover su cita y el bot le ofrece otro horario libre, sin que tú intervengas.',
    biz: 'Barbería Distrito', bizInitials: 'BD',
    script: [
      ['c', 'Hola, no voy a poder ir el jueves a las 4 😓 ¿la puedo mover?', '8:12 a. m.'],
      ['typing'],
      ['b', 'Claro Andrés. Julián tiene libre el viernes a las 4:00 p. m. o el sábado a las 11:00 a. m.', '8:12 a. m.'],
      ['c', 'El viernes a las 4', '8:13 a. m.'],
      ['typing'],
      ['b', 'Listo, tu cita quedó para el viernes a las 4:00 p. m. Ya liberé el espacio del jueves.', '8:13 a. m.'],
      ['sys', 'Cita movida en tu panel: jueves 4:00 p. m. → viernes 4:00 p. m.'],
    ],
  },
  {
    title: 'Responde precios y duración.',
    sub: 'Con los servicios y precios que tú configuras.',
    biz: 'Spa Aurora', bizInitials: 'SA',
    script: [
      ['c', '¿Cuánto vale el masaje relajante?', '3:30 p. m.'],
      ['typing'],
      ['b', 'El masaje relajante cuesta $85.000 y dura 60 minutos. ¿Te agendo uno?', '3:30 p. m.'],
    ],
  },
  {
    title: 'Pide el anticipo y tú lo apruebas.',
    sub: 'El cliente envía la foto del comprobante y tú lo apruebas desde el panel.',
    biz: 'Spa Aurora', bizInitials: 'SA',
    script: [
      ['b', 'Para separar tu cita necesitamos un anticipo de $30.000. Envíanos el comprobante por aquí.', '9:40 p. m.'],
      ['img'],
      ['typing'],
      ['b', 'Recibido, Laura. Apenas lo verifiquen te confirmo.', '9:43 p. m.'],
      ['sys', 'Anticipo de $30.000 aprobado desde tu panel'],
    ],
  },
  {
    title: 'Te pasa la conversación cuando no sabe.',
    sub: 'Si la pregunta se sale de lo común, el bot no inventa: avisa y te la pasa.',
    biz: 'Spa Aurora', bizInitials: 'SA',
    script: [
      ['c', '¿Hacen masajes a domicilio para una despedida de 12 personas?', '6:05 p. m.'],
      ['typing'],
      ['b', 'Buena pregunta. Ya le paso tu mensaje al equipo.', '6:05 p. m.'],
      ['sys', 'Conversación transferida a ti'],
    ],
  },
];

/** [title, description, dashboard nav item that becomes active] */
export const PANEL_ITEMS = [
  ['Tu día de un vistazo.', 'Inicio con la caja del día como tarjeta principal y las citas de hoy.', 'Inicio'],
  ['Agenda por trabajador.', 'Columnas por persona y bloques de cita por hora.', 'Citas'],
  ['Caja diaria.', 'Ingresos y egresos del día, con el total que sube cuando entra un abono.', 'Caja Diaria'],
  ['Anticipos por verificar.', 'El comprobante que envió el cliente y el botón para aprobarlo.', 'Pagos'],
  ['Tus clientes.', 'Historial de citas de cada cliente.', 'Clientes'],
] as const;

export const PANEL_MOBILE_TITLES = ['Hola, Sebastián', 'Citas', 'Caja diaria', 'Anticipo por verificar', 'Clientes'] as const;

export const DASH_NAV = [
  'Inicio', 'Citas', 'Clientes', 'Caja Diaria', 'Bonos', 'Pagos', 'Servicios', 'Equipo', 'Analíticas', 'Configuración',
] as const;

export const TODAY = [
  ['Laura Restrepo', 'Masaje relajante', '3:00 p. m.'],
  ['Natalia Gil', 'Exfoliación corporal', '3:30 p. m.'],
  ['Isabel Duque', 'Masaje relajante', '4:30 p. m.'],
] as const;

/** Cash register: [time, movement, client/category, detail, amount, isIncome] */
export const CASH_ROWS = [
  ['2:05 p. m.', 'Pago de cita', 'Juliana Toro', 'Masaje con piedras', '+$ 120.000', true],
  ['12:40 p. m.', 'Pago de cita', 'Natalia Gil', 'Exfoliación corporal', '+$ 95.000', true],
  ['11:10 a. m.', 'Venta de bono', 'Isabel Duque', 'Bono AEFV-MJ7U', '+$ 150.000', true],
  ['10:30 a. m.', 'Compra de insumos', 'Egreso', 'Aceites y toallas', '-$ 50.000', false],
  ['9:29 a. m.', 'Pago de cita', 'Mariana Ríos', 'Facial hidratante', '+$ 70.000', true],
] as const;

export const CASH = {
  todayNet: 2135000,
  incomeBefore: 2155000,
  incomeAfter: 2185000,
  expenses: 50000,
} as const;

/** [name, phone, appointments, last visit] */
export const CLIENTS = [
  ['Laura Restrepo', '+57 310 482 1937', '12', '24 sep'],
  ['Andrés Gómez', '+57 315 220 6614', '8', '19 sep'],
  ['Daniela Muñoz', '+57 301 774 0582', '5', '12 sep'],
  ['Carlos Mejía', '+57 318 905 3321', '3', '2 sep'],
  ['Mariana Ríos', '+57 312 640 1198', '9', '24 sep'],
  ['Juliana Toro', '+57 300 118 4476', '6', '24 sep'],
] as const;

/** [service, date, worker, price] */
export const CLIENT_HISTORY = [
  ['Masaje relajante', '24 sep', 'Camila', '$85.000'],
  ['Facial hidratante', '30 ago', 'Sara', '$70.000'],
  ['Masaje relajante', '2 ago', 'Camila', '$85.000'],
  ['Exfoliación corporal', '5 jul', 'Paula', '$95.000'],
] as const;

export const TRUST = [
  'API oficial de WhatsApp Business',
  'Tus datos protegidos según la Ley 1581 de Colombia',
  'Cada negocio con sus datos aislados',
] as const;

export const START_STEPS = [
  ['Hablas con un asesor.', 'Te mostramos NuvelLab con ejemplos de tu tipo de negocio.'],
  ['Configuramos tu negocio.', 'Servicios, precios, horarios y tu equipo.'],
  ['Tu bot empieza a contestar.', 'Y tú lo ves todo desde tu panel.'],
] as const;

export const FAQ = [
  ['¿Cuánto cuesta?', 'Depende de tu negocio. Lo definimos contigo en la demo.'],
  ['¿Qué pasa si el bot no sabe responder algo?', 'Te pasa la conversación para que respondas tú, sin que el cliente quede esperando.'],
  ['¿Funciona si tengo varios trabajadores?', 'Sí. Cada trabajador tiene su propia agenda y el bot solo ofrece los horarios en que está libre.'],
  ['¿Dónde quedan mis datos y los de mis clientes?', 'Protegidos según la Ley 1581, y los de tu negocio nunca se mezclan con los de otro.'],
  ['¿Tengo que cambiar mi número de WhatsApp?', 'No. El bot contesta desde el mismo número que tus clientes ya conocen.'],
  ['¿Cuánto tarda en estar listo?', 'Entre 2 y 3 días, mientras conectamos tu número a la API oficial de WhatsApp.'],
] as const;
