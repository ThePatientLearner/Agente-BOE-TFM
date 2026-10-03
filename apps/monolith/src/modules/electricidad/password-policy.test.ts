/**
 * La política de contraseñas es la única defensa entre una cuenta y un
 * diccionario. Estos tests fijan qué se rechaza y, sobre todo, qué NO se
 * rechaza: una regla demasiado estricta empuja a la gente a "LaCabra1!" y a
 * apuntarlo en un papel, que es peor que una frase larga.
 */
import { describe, expect, it } from 'vitest';
import { passwordProblem } from './password-policy.js';

const vale = (value: string, user?: string) => expect(passwordProblem(value, user)).toBeNull();
const falla = (value: string, user?: string) => expect(passwordProblem(value, user)).toEqual(expect.any(String));

describe('política de contraseñas', () => {
  it('exige al menos 10 caracteres', () => {
    falla('Abc123!x');        // 8, la que valía antes
    falla('Abc123!xy');       // 9
    vale('Abc123!xyz');       // 10
  });

  it('no acepta más de 128 caracteres', () => {
    falla('Aa1!'.repeat(33));
  });

  it('con menos de 16 caracteres pide combinar tres tipos de carácter', () => {
    falla('solominusculas');       // solo un tipo (14)
    falla('solominuscula1');       // dos tipos
    vale('Solominuscula1');        // mayúscula + minúscula + número
    vale('solominuscula1!');       // minúscula + número + símbolo
  });

  // Lo contrario empuja a sustituir una frase buena por "LaCabra1!".
  it('una frase larga vale sin mayúsculas, números ni símbolos', () => {
    vale('la cabra tira al monte');
    vale('dieciseis letras');
  });

  it('rechaza las contraseñas que se prueban primero', () => {
    falla('contrasena');
    falla('password123');
    falla('qwertyuiop');
    falla('bienvenido');
  });

  it('rechaza secuencias del teclado y del alfabeto', () => {
    falla('Abcdefg1!');
    falla('Zyxwvuts1!');
    falla('Pepe123456!');
  });

  // Variedad suficiente no basta si apenas hay caracteres distintos.
  it('rechaza repetir cuatro caracteres en bucle', () => {
    falla('Aa1!Aa1!Aa1!');
    falla('aaaaaaaaaaaa');
  });

  it('rechaza una contraseña que contenga el nombre de usuario', () => {
    falla('Roberto2026!', 'roberto');
    falla('xxRobertoxx1!', 'Roberto');
    // Y no le molesta a quien no comparte nada con su nombre.
    vale('Tramontana77!', 'roberto');
  });

  // Un nombre corto aparecería dentro de demasiadas contraseñas legítimas.
  it('no aplica la regla del nombre a usuarios de menos de 4 letras', () => {
    vale('Abo2026Xyz!', 'abo');
  });

  it('no acepta una contraseña hecha casi toda de espacios', () => {
    falla('Aa1!      ');
  });

  it('un valor que no es texto se rechaza sin romperse', () => {
    falla(undefined as unknown as string);
    falla(123456789012 as unknown as string);
    falla(null as unknown as string);
  });
});
