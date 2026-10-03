/**
 * Qué contraseña se acepta al CREARLA o al cambiarla. No se aplica al entrar:
 * subir la exigencia no puede dejar fuera a quien ya tiene cuenta, así que las
 * contraseñas antiguas siguen sirviendo para iniciar sesión hasta que su dueño
 * las cambie.
 *
 * El criterio sigue la recomendación del NIST (SP 800-63B): manda la longitud,
 * y se rechaza lo que de verdad se rompe —lo común, lo secuencial, el propio
 * nombre de usuario— en vez de imponer una receta de símbolos. De ahí la regla
 * de las frases: a partir de 16 caracteres no se exige variedad, porque forzar
 * un símbolo en "la cabra tira al monte" la empeora en lugar de mejorarla —
 * empuja a la gente a "LaCabra1!" y a apuntarlo en un papel.
 */

const MINIMO = 10;
const MAXIMO = 128;
/** A partir de aquí la longitud basta y no se exige variedad de caracteres. */
const FRASE = 16;

/**
 * Las que se prueban primero en un ataque real. No pretende ser una lista
 * exhaustiva —para eso haría falta consultar un servicio de filtraciones—,
 * sino cerrar lo que aparece en cabeza de cualquier diccionario, en español
 * y en inglés.
 */
const COMUNES = new Set([
  '1234567890', '12345678901', '123456789012', '0123456789',
  'contrasena', 'contraseña', 'contrasena1', 'password12', 'password123', 'passw0rd123',
  'qwertyuiop', 'asdfghjkl', 'qwerty12345', '1q2w3e4r5t',
  'iloveyou12', 'administrador', 'adminadmin', 'letmein123',
  'bienvenido', 'bienvenido1', 'estrella1', 'barcelona1', 'realmadrid',
  'miconstrasena', 'micontrasena', 'noloseque', 'cambiame1', 'cambiarme1',
]);

/** "abcdef", "123456", "fedcba": seis pasos seguidos en la misma dirección. */
function esSecuencia(value: string): boolean {
  const limpio = value.toLowerCase();
  let seguidos = 1, direccion = 0;
  for (let i = 1; i < limpio.length; i++) {
    const salto = limpio.charCodeAt(i) - limpio.charCodeAt(i - 1);
    if (salto === direccion && (salto === 1 || salto === -1)) {
      if (++seguidos >= 6) return true;
    } else {
      direccion = salto === 1 || salto === -1 ? salto : 0;
      seguidos = direccion === 0 ? 1 : 2;
    }
  }
  return false;
}

function variedad(value: string): number {
  return [/[a-záéíóúüñ]/.test(value), /[A-ZÁÉÍÓÚÜÑ]/.test(value), /\d/.test(value), /[^\p{L}\p{N}]/u.test(value)]
    .filter(Boolean).length;
}

/**
 * Devuelve el motivo por el que NO se acepta, o `null` si está bien. Se
 * devuelve un motivo y no un booleano porque "no vale" sin decir por qué deja
 * a la gente probando variaciones a ciegas.
 */
export function passwordProblem(value: unknown, username?: string): string | null {
  if (typeof value !== 'string') return `La contraseña debe tener entre ${MINIMO} y ${MAXIMO} caracteres.`;
  if (value.length < MINIMO || value.length > MAXIMO) return `La contraseña debe tener entre ${MINIMO} y ${MAXIMO} caracteres.`;
  if (value.trim().length < MINIMO) return 'La contraseña no puede ser casi toda espacios.';

  const plano = value.toLowerCase();
  if (COMUNES.has(plano)) return 'Esa contraseña es de las primeras que se prueban. Elige otra.';
  if (new Set(plano).size <= 3) return 'Repite muy pocos caracteres distintos. Mézclalos más.';
  if (esSecuencia(value)) return 'Evita secuencias seguidas del teclado o del alfabeto, como "123456" o "abcdef".';

  // El nombre de usuario es público: una contraseña que lo contiene es lo
  // primero que prueba quien ya sabe a quién ataca.
  const nombre = (username ?? '').trim().toLowerCase();
  if (nombre.length >= 4 && plano.includes(nombre)) return 'La contraseña no puede contener tu nombre de usuario.';

  if (value.length < FRASE && variedad(value) < 3) {
    return `Con menos de ${FRASE} caracteres hace falta combinar al menos tres de estos cuatro: minúsculas, mayúsculas, números y símbolos. O usa una frase de ${FRASE} caracteres o más.`;
  }
  return null;
}

/** Para la ayuda que se le enseña a quien está eligiendo contraseña. */
export const PASSWORD_RULES = {
  minimum: MINIMO,
  passphrase: FRASE,
} as const;
