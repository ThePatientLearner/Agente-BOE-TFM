// Generado desde el curso privado por scripts/generate-electricidad-context.mjs.
// Regenerar tras modificar el temario. Sin preguntas, usuarios ni secretos.
import type { StudyCourse } from '../domain/study-course.js';

export const electricidadCourse: StudyCourse = {
  "updatedAt": "2026-10-05",
  "sections": [
    {
      "id": "fund",
      "title": "Fundamentos y electrotecnia",
      "cards": [
        {
          "id": "ohm",
          "title": "1. Tensión, corriente y ley de Ohm",
          "text": "U = R·I\nTensión (U) es la diferencia de potencial entre dos puntos; se mide en voltios (V). Corriente (I) es la carga que circula; se mide en amperios (A). Resistencia (R) se opone a ese paso; se mide en ohmios (Ω).\nEn una resistencia: U = R·I. Si buscas corriente, I = U/R; si buscas resistencia, R = U/I. Antes de operar convierte 30 mA en 0,030 A y 2 kΩ en 2.000 Ω.\nEjemplo: 230 V sobre 46 Ω producen 5 A. Si la resistencia se mantiene y duplicas la tensión, también duplicas la corriente.\nEn alterna con bobinas o condensadores se utiliza la impedancia Z, que incluye otros efectos además de R. El voltímetro mide entre dos puntos; el amperímetro se intercala en serie mediante un procedimiento seguro. Nunca pongas un amperímetro directamente entre los polos de una fuente.\nIdea clave: Para una resistencia, más tensión produce más corriente.\nComprobación: I = U/R = 230/46 = 5 A.\nConfusión frecuente: No confundas mA con A ni kΩ con Ω. Un amperímetro conectado directamente en paralelo a una fuente puede provocar un cortocircuito.",
          "references": [
            {
              "label": "Electrotecnia · desarrollo didáctico propio, no texto literal REBT",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-3"
            }
          ]
        },
        {
          "id": "serie",
          "title": "2. Circuitos en serie y en paralelo",
          "text": "Serie suma R · paralelo suma inversas\nSerie: hay un único camino para la corriente. Todas las resistencias llevan la misma I y sus valores se suman: R_eq = R₁ + R₂ + … La tensión total se reparte.\nParalelo: las ramas se conectan entre los mismos dos puntos y reciben la misma U. Se suman las inversas: 1/R_eq = 1/R₁ + 1/R₂ + … Para dos ramas: R_eq = R₁R₂/(R₁ + R₂).\nEjemplo: dos resistencias de 10 Ω dan 20 Ω en serie y 5 Ω en paralelo. Con resistencias positivas, el paralelo siempre queda por debajo de la menor rama.\nLas leyes de Kirchhoff ayudan a comprobar el resultado: en un nudo, corriente que entra = corriente que sale; al recorrer una malla cerrada, la suma de subidas y caídas de tensión es cero.\nIdea clave: En serie se comparte corriente; en paralelo se comparte tensión.\nComprobación: 5 Ω: dos ramas iguales reducen la resistencia equivalente a la mitad.\nConfusión frecuente: En paralelo la resistencia equivalente debe ser menor que la menor rama resistiva positiva.",
          "references": [
            {
              "label": "Electrotecnia · desarrollo didáctico propio, no texto literal REBT",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-3"
            }
          ]
        },
        {
          "id": "resistencia",
          "title": "3. Longitud, sección y temperatura del cable",
          "text": "R = ρL/S · Rθ = R₂₀[1+α(θ−20)]\nLa resistencia del conductor es R = ρL/S. ρ representa la resistividad del material; L, la longitud; S, la sección. Usa unidades compatibles: Ω·mm²/m, m y mm². La conductividad es γ = 1/ρ.\nEjemplo: si ρ = 0,0175 Ω·mm²/m, L = 20 m y S = 2,5 mm², un conductor tiene R = 0,14 Ω. Dos conductores iguales de ida y retorno suman 0,28 Ω.\nLa temperatura también cambia R. Con el coeficiente α referido a 20 °C: Rθ = R₂₀[1 + α(θ − 20)]. Para un metal con α positivo, al calentarse aumenta su resistencia. Usa el dato y la temperatura de referencia del enunciado.\nDecide primero si calculas un conductor o el bucle completo. Si la fórmula ya incorpora el factor 2 de ida y vuelta, no vuelvas a duplicar L.\nIdea clave: Un cable más largo ofrece más resistencia; uno más grueso, menos.\nComprobación: Se reduce a la mitad, porque R = ρL/S.\nConfusión frecuente: El factor 2 de un circuito de dos hilos ya incluye ida y vuelta: no dupliques L otra vez.",
          "references": [
            {
              "label": "Electrotecnia · desarrollo didáctico propio, no texto literal REBT",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-3"
            }
          ]
        },
        {
          "id": "potencias",
          "title": "4. Qué potencia te están dando",
          "text": "P [W] · S [VA] · Q [var]\nP, activa (W): potencia que se transforma en trabajo, calor o luz.\nS, aparente (VA): producto de tensión y corriente eficaces.\nQ, reactiva (var): intercambio asociado a campos eléctricos y magnéticos.\nEn régimen senoidal: S² = P² + Q², cos φ = P/S y Q = P·tan φ. Para potencia activa: CC: P = UI; monofásica: P = UI cos φ; trifásica equilibrada: P = √3 U_L I_L cos φ. En la última, U_L es tensión entre fases y P es la potencia total.\nEn motores, distingue la potencia útil en el eje de la eléctrica absorbida: P_abs = P_útil/η. Si el enunciado ya da la absorbida, no apliques de nuevo el rendimiento.\nEjemplo: un receptor monofásico de 230 V, 10 A y cos φ = 0,8 absorbe 1.840 W, aunque su potencia aparente sea 2.300 VA. Con armónicos, factor de potencia y cos φ pueden ser diferentes.\nIdea clave: P es potencia activa; S es aparente; Q es reactiva.\nComprobación: 1.000 W: P_abs = P_útil/η = 900/0,90.\nConfusión frecuente: kW no es kVA; potencia útil no es absorbida; en trifásica no uses 230 V donde la fórmula pide tensión de línea de 400 V.",
          "references": [
            {
              "label": "Electrotecnia · desarrollo didáctico propio, no texto literal REBT",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-3"
            }
          ]
        },
        {
          "id": "energia",
          "title": "5. Potencia, energía y pérdidas",
          "text": "E=P·t · η=Psalida/Pentrada\nLa potencia describe el ritmo de consumo; la energía, el consumo acumulado. E = P·t: kW × h da kWh; W × h da Wh. Por ejemplo, 2 kW durante 3 horas son 6 kWh.\nEl rendimiento compara salida útil y entrada: η = P_salida/P_entrada. Un 90 % se introduce como 0,90, no como 90.\nLas pérdidas por calentamiento en un conductor son I²R. Si duplicas I y mantienes R, las pérdidas se multiplican por cuatro. Si hay varios conductores, suma sus pérdidas.\nConvención de este curso: las hojas CEG emplean 1 CV = 736 W. Es su redondeo didáctico, no una prescripción del REBT.\nIdea clave: La energía depende de la potencia y del tiempo de uso.\nComprobación: 6 kWh: E = 2 × 3.\nConfusión frecuente: No expreses una potencia en kWh. Si duplicas la corriente, las pérdidas I²R se cuadruplican, no se duplican.",
          "references": [
            {
              "label": "Electrotecnia · desarrollo didáctico propio, no texto literal REBT",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-3"
            },
            {
              "label": "Criterio CEG comunicado en el briefing del alumno, 28/09/2026",
              "url": "#fuentes"
            }
          ]
        },
        {
          "id": "alterna",
          "title": "6. Estrella, triángulo e impedancia",
          "text": "Estrella: U_L=√3 U_f · triángulo: I_L=√3 I_f\nEn trifásica, línea describe los conductores de alimentación; fase, cada rama de la carga. Los valores usuales de suministro son 230/400 V y 50 Hz.\nEstrella equilibrada: U_L = √3 U_f; I_L = I_f.\nTriángulo equilibrado: U_L = U_f; I_L = √3 I_f.\nEn un circuito RLC serie, la bobina y el condensador aportan reactancias: X_L = 2πfL y X_C = 1/(2πfC). La impedancia es Z = √[R² + (X_L − X_C)²]. Introduce L en henrios (H) y C en faradios (F): 10 μF = 10 × 10⁻⁶ F.\nLas tensiones indicadas normalmente son valores eficaces. No los sustituyas por valores de pico sin que el ejercicio lo pida.\nIdea clave: Identifica la conexión antes de relacionar valores de línea y de fase.\nComprobación: 400 V: U_L = √3 × 230 ≈ 398 V.\nConfusión frecuente: No apliques relaciones de estrella a una conexión triángulo ni confundas valores eficaces con valores de pico.",
          "references": [
            {
              "label": "Electrotecnia · desarrollo didáctico propio, no texto literal REBT",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-3"
            },
            {
              "label": "REBT · art. 4",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099"
            }
          ]
        },
        {
          "id": "transformador",
          "title": "7. Transformar tensión y separar circuitos",
          "text": "U₁/U₂=N₁/N₂=I₂/I₁, modelo ideal\nUn transformador cambia la tensión según su número de espiras: en el modelo ideal, U₁/U₂ = N₁/N₂ = I₂/I₁. Al reducir la tensión puede aumentar la corriente, conservando la potencia ideal.\nEjemplo ideal: de 230 V a 23 V, la tensión baja diez veces; para la misma potencia, la corriente secundaria es diez veces la primaria. Un transformador real tiene pérdidas y límites nominales.\nLa separación galvánica significa que no existe conexión conductora directa entre primario y secundario. Un autotransformador no proporciona esa separación.\nUna fuente de MBTS —muy baja tensión de seguridad— debe cumplir los requisitos de seguridad correspondientes. Una salida de pocos voltios, por sí sola, no demuestra que sea una fuente de seguridad.\nIdea clave: Reducir la tensión y aislar eléctricamente son funciones diferentes.\nComprobación: No. Primario y secundario comparten parte del devanado.\nConfusión frecuente: Baja tensión de salida y aislamiento de protección son características distintas.",
          "references": [
            {
              "label": "Electrotecnia · desarrollo didáctico propio, no texto literal REBT",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-3"
            },
            {
              "label": "ITC-BT-24 · §4.5",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-24"
            },
            {
              "label": "ITC-BT-48 · §2",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-48"
            }
          ]
        }
      ]
    },
    {
      "id": "reg",
      "title": "Reglamento: artículos y criterios generales",
      "cards": [
        {
          "id": "ambito",
          "title": "1. Dónde se aplica el REBT",
          "text": "≤1.000 V CA · ≤1.500 V CC\nEl REBT se aplica a las instalaciones incluidas en su campo con tensión nominal ≤1.000 V en corriente alterna (CA) o ≤1.500 V en continua (CC). Una tensión usual, como 230 V, no es el límite del reglamento.\nEl artículo 4 distingue: muy baja tensión, hasta 50 V CA o 75 V CC; tensión usual, por encima de esos límites y hasta 500 V CA o 750 V CC; tensión especial, por encima y hasta el límite de baja tensión.\nEjemplo: 800 V CC es tensión especial y sigue siendo baja tensión a efectos del REBT. Clasificar la tensión no elimina las excepciones y condiciones de ámbito del artículo 2.\nIdea clave: Baja tensión llega hasta 1.000 V CA o 1.500 V CC, incluidos.\nComprobación: Sí. El límite dice igual o inferior a 1.000 V CA, dentro de su ámbito.\nConfusión frecuente: Las palabras «igual o inferior» incluyen la frontera. No sustituyas tensión nominal por tensión de ensayo.",
          "references": [
            {
              "label": "REBT · art. 2",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099"
            },
            {
              "label": "REBT · art. 4",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099"
            }
          ]
        },
        {
          "id": "modificacion",
          "title": "2. Reformas y modificaciones de importancia",
          "text": "Importancia: >50 % de potencia y otros supuestos\nEn una instalación anterior a la entrada en vigor del REBT, la parte modificada, reparada o ampliada debe cumplir lo aplicable. Además hay que garantizar la seguridad de la instalación completa; el resto no se ignora.\nSe consideran de importancia las modificaciones o reparaciones que afectan a más del 50 % de la potencia instalada. También lo es la modificación de líneas completas de procesos productivos con nuevos circuitos y cuadros, aunque reduzca potencia.\nPara el examen: comprueba primero el alcance de la obra y después sus efectos sobre documentación e inspección inicial. Una potencia menor no descarta por sí sola una modificación de importancia.\nIdea clave: Una reforma debe cumplir en la parte afectada y conservar la seguridad del conjunto.\nComprobación: Sí, si afecta a líneas completas de procesos productivos con nuevos circuitos y cuadros, en el supuesto del artículo 2.\nConfusión frecuente: Una reducción de potencia no excluye por sí sola que la modificación sea de importancia.",
          "references": [
            {
              "label": "REBT · art. 2",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099"
            }
          ]
        },
        {
          "id": "otros",
          "title": "3. Elegir la ITC según el entorno",
          "text": "Agrario, elevación, caravanas, puertos, muebles, sauna y automatización\nAntes de calcular, identifica para qué se usa el lugar y qué riesgos presenta. Agua, animales, temperatura o condiciones médicas pueden introducir requisitos distintos de una vivienda seca.\nLa tabla es un mapa para localizar la instrucción, no una lista de temas excluidos del examen. Lee las condiciones concretas y las referencias cruzadas. La especialidad de generación no habilita por sí sola para ejecutar las demás modalidades reservadas a especialista.\nEntorno | ITC y foco | \nAgrícola/ganadero | 35: animales, humedad, equipotencialidad | \nElevación y transporte | 32: corte, protección y maquinaria | \nTensiones especiales / quirófanos | 37/38: requisitos y límites de especialidad | \nCercas / caravanas / puertos | 39/41/42: fuentes, tomas y protección | \nMuebles / saunas | 49/50: cableado, temperatura y zonas | \nAutomatización | 51: circuitos y seguridad |\nIdea clave: El lugar de instalación puede cambiar la regla general.\nComprobación: La ITC-BT-35, además de las prescripciones generales y específicas que correspondan.\nConfusión frecuente: No tratar todos los locales como viviendas secas; ni asumir que generación habilita quirófanos.",
          "references": [
            {
              "label": "ITC-BT-35",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-35"
            },
            {
              "label": "ITC-BT-32",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-32"
            },
            {
              "label": "ITC-BT-37",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-37"
            },
            {
              "label": "ITC-BT-38",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-38"
            },
            {
              "label": "ITC-BT-39",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-39"
            },
            {
              "label": "ITC-BT-41",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-41"
            },
            {
              "label": "ITC-BT-42",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-42"
            },
            {
              "label": "ITC-BT-49",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-49"
            },
            {
              "label": "ITC-BT-50",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-50"
            },
            {
              "label": "ITC-BT-51",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-51"
            }
          ]
        },
        {
          "id": "v3-reg-1",
          "title": "4. Seguridad y documentación para el titular",
          "text": "Objeto, ámbito, titular y documentación no son lo mismo.\nEl objetivo del reglamento es proteger a personas y bienes, asegurar el funcionamiento y evitar perturbaciones. Encender una lámpara demuestra funcionamiento, pero no comprueba aislamiento, puesta a tierra ni protección.\nLos límites de baja tensión son 1.000 V CA y 1.500 V CC, con igualdad incluida. No los confundas con las tensiones usuales de suministro ni con las de ensayo.\nEl titular recibe la información de la instalación, instrucciones y precauciones de utilización contempladas en el artículo 19. El certificado de instalación es una pieza de la documentación, no sustituye toda la información de uso.\nIdea clave: Que la instalación funcione no demuestra que cumpla el REBT.\nComprobación: El titular, con instrucciones y precauciones de uso, conforme al artículo 19.\nConfusión frecuente: No conviertas una guía didáctica en una obligación legal ni una potencia contratada en la potencia de diseño.",
          "references": [
            {
              "label": "REBT · arts. 1, 2, 4, 10, 18, 19, 20, 21 y 29",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099"
            }
          ]
        },
        {
          "id": "v3-reg-2",
          "title": "5. Mantenimiento y valor de las guías",
          "text": "Objeto, ámbito, titular y documentación no son lo mismo.\nEl titular debe conservar la instalación en buen estado y atender al mantenimiento correspondiente. Haber obtenido un certificado no elimina esa obligación ni las inspecciones que resulten aplicables.\nLa guía ministerial tiene carácter no vinculante: ayuda a comprender el REBT, pero una explicación de la guía no se convierte automáticamente en una obligación reglamentaria.\nAl estudiar, separa el texto del BOE, las normas a las que remite y las convenciones de clase. Si una respuesta depende de una condición, conserva esa condición en tus apuntes.\nIdea clave: El titular conserva la instalación; la guía ayuda a interpretar el reglamento.\nComprobación: No. El artículo 29 la define como guía de carácter no vinculante.\nConfusión frecuente: No conviertas una guía didáctica en una obligación legal ni una potencia contratada en la potencia de diseño.",
          "references": [
            {
              "label": "REBT · arts. 1, 2, 4, 10, 18, 19, 20, 21 y 29",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099"
            }
          ]
        }
      ]
    },
    {
      "id": "bt01",
      "title": "Terminología",
      "cards": [
        {
          "id": "v3-bt01-3",
          "title": "1. Partes activas, masas y contactos",
          "text": "Identifica qué elemento tocas, qué corriente aparece y qué función cumple cada conductor.\nParte activa: conductor o parte destinada a estar en tensión en servicio normal, con las precisiones de la definición reglamentaria.\nMasa: parte conductora accesible de un equipo, normalmente sin tensión, que puede quedar en tensión por un defecto.\nContacto directo: contacto con una parte activa.\nContacto indirecto: contacto con una masa que se ha puesto accidentalmente en tensión.\nEl conductor de protección (PE) participa en la protección contra contactos indirectos. Su continuidad debe mantenerse; no se usa como conductor normal de alimentación.\nEjemplo: un conductor activo descubierto y la carcasa averiada de una lavadora plantean contactos diferentes. No todo objeto metálico del edificio es una masa eléctrica.\nIdea clave: Directo es tocar una parte activa; indirecto, una masa con tensión por defecto.\nComprobación: Contacto indirecto: la carcasa es una masa puesta en tensión por defecto.\nConfusión frecuente: Masa no significa cualquier metal; neutro no significa ausencia de tensión; sobrecarga no significa cortocircuito.",
          "references": [
            {
              "label": "ITC-BT-01 · definiciones; ITC-BT-24 · §§3–4",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib"
            }
          ]
        },
        {
          "id": "v3-bt01-4",
          "title": "2. Neutro, PEN, sobrecarga y cortocircuito",
          "text": "Identifica qué elemento tocas, qué corriente aparece y qué función cumple cada conductor.\nEl neutro (N) puede transportar corriente. No se considera seguro al tacto solo por llamarse neutro. El PEN reúne en un único conductor las funciones de protección y neutro; no equivale a tener N y PE separados.\nSobrecarga: sobreintensidad en un circuito eléctricamente sano, por ejemplo al superar su demanda admisible. Cortocircuito: conexión de defecto de baja impedancia entre puntos a distinto potencial; puede producir una corriente muy elevada.\nLa intensidad de cortocircuito depende de la fuente y de la impedancia del bucle. No se obtiene simplemente sumando los vatios de los aparatos.\nIdea clave: El neutro puede llevar corriente; sobrecarga y cortocircuito son fallos distintos.\nComprobación: Sobrecarga: la corriente excesiva circula en un circuito eléctricamente sano.\nConfusión frecuente: Masa no significa cualquier metal; neutro no significa ausencia de tensión; sobrecarga no significa cortocircuito.",
          "references": [
            {
              "label": "ITC-BT-01 · definiciones; ITC-BT-24 · §§3–4",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib"
            }
          ]
        },
        {
          "id": "v3-bt01-5",
          "title": "3. Fuga y seccionamiento",
          "text": "Identifica qué elemento tocas, qué corriente aparece y qué función cumple cada conductor.\nUna corriente de fuga circula hacia tierra o partes conductoras por caminos distintos del recorrido normal previsto. Puede existir incluso sin un defecto de aislamiento; no toda fuga es un cortocircuito.\nEl seccionamiento separa una instalación o parte de ella de sus fuentes de energía para lograr el aislamiento requerido. Un mando de encendido o parada no garantiza esa separación.\nEjemplo: una máquina parada puede conservar tensión en su cuadro o recibir energía de otra fuente. La condición eléctrica se comprueba con el procedimiento correspondiente, no por la posición de un botón.\nIdea clave: Apagar un receptor no demuestra que esté separado de todas sus fuentes.\nComprobación: No. Parada y seccionamiento tienen funciones diferentes.\nConfusión frecuente: Masa no significa cualquier metal; neutro no significa ausencia de tensión; sobrecarga no significa cortocircuito.",
          "references": [
            {
              "label": "ITC-BT-01 · definiciones; ITC-BT-24 · §§3–4",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib"
            }
          ]
        }
      ]
    },
    {
      "id": "bt02",
      "title": "Normas de referencia",
      "cards": [
        {
          "id": "reforma",
          "title": "1. Estudiar con fuentes actuales",
          "text": "RD 298/2021 · guías no vinculantes\nLa reforma del RD 298/2021, con efectos desde el 1 de julio de 2021, cambió requisitos de instaladores y empresas. No estudies la antigua figura del CCI como si describiera sin cambios la vía actual de este curso.\nUsa el BOE para la regla reglamentaria y BT-02 para sus normas y ediciones de referencia. La guía ministerial es una ayuda no vinculante. Los criterios CEG del material se identifican como convenciones de ejercicio, sin atribuirles valor normativo.\nCuando compares apuntes, comprueba la fecha y el apartado: una cifra correcta en otro contexto puede dar una respuesta incorrecta aquí.\nIdea clave: Un texto antiguo no prueba cuál es el requisito actual.\nComprobación: No. Hay que contrastar la obligación con el reglamento y sus referencias aplicables.\nConfusión frecuente: Un libro antiguo no convierte su texto en vigente. No confundir una guía o borrador con el reglamento.",
          "references": [
            {
              "label": "ITC-BT-03",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-3"
            },
            {
              "label": "ITC-BT-02",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-2"
            },
            {
              "label": "REBT · art. 29",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099"
            }
          ]
        },
        {
          "id": "buscar",
          "title": "2. Buscar una regla paso a paso",
          "text": "Uso → ITC → apartado → tabla y notas\nIdentifica la instalación: vivienda, motor, generadora, recarga u otro uso.\nLocaliza su ITC particular y las reglas generales a las que remite.\nLee el apartado completo, la tabla y sus notas.\nComprueba unidades, límites y excepciones antes de contestar.\nEl apéndice II de BT-03 sirve como mapa de conocimientos mínimos; BT-02, para las normas referenciadas. Las reglas particulares pueden completar o modificar las generales.\nOrientación útil: protección contra sobreintensidades es BT-22; contra sobretensiones, BT-23. Comprueba las referencias cruzadas del material en lugar de memorizarlas sin revisar.\nIdea clave: Primero identifica el uso; después lee la ITC, el apartado y las notas.\nComprobación: El encabezado, el supuesto, las condiciones y las notas que determinan cuándo vale.\nConfusión frecuente: La referencia cruzada del apéndice puede contener errores: sobreintensidades es BT-22 y sobretensiones BT-23.",
          "references": [
            {
              "label": "ITC-BT-03 · apéndice II",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-3"
            },
            {
              "label": "ITC-BT-02",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-2"
            },
            {
              "label": "ITC-BT-22",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-22"
            },
            {
              "label": "ITC-BT-23",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-23"
            }
          ]
        },
        {
          "id": "v3-bt02-6",
          "title": "3. Número, edición y periodo transitorio",
          "text": "Número de norma, edición y fecha de coexistencia son datos diferentes.\nEl número identifica la norma; el año o edición identifica su versión. BT-02 conecta las referencias del REBT con sus ediciones y condiciones.\nUn periodo de coexistencia permite la transición en los términos indicados, hasta su fecha límite. No convierte cualquier versión antigua en una alternativa permanente.\nAl usar una tabla, comprueba material, temperatura, método de instalación y número de conductores cargados. El valor solo sirve dentro de las condiciones que lo acompañan.\nIdea clave: El número de norma y su edición son datos distintos.\nComprobación: No. Hay que respetar las fechas y condiciones de transición del listado.\nConfusión frecuente: Una referencia antigua impresa dentro de una ITC no permite ignorar el listado actualizado. No inventes tablas UNE no consultadas.",
          "references": [
            {
              "label": "ITC-BT-02 · listado y notas; REBT · arts. 23, 26 y 29",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-2"
            }
          ]
        },
        {
          "id": "v3-bt02-7",
          "title": "4. Reconocer qué documento necesitas",
          "text": "Número de norma, edición y fecha de coexistencia son datos diferentes.\nUNE-HD 60364-5-52: elección e instalación de canalizaciones, con condiciones para conductores y cables.\nUNE-HD 60364-6: verificación de instalaciones.\nUNE-EN ISO/IEC 17024: certificación de personas; no es una tabla para dimensionar un cable.\nLa guía y la norma tienen naturaleza y alcance distintos. Si no has consultado una tabla UNE, no inventes su contenido a partir de un resumen. Comprueba primero el listado de BT-02 y las prescripciones del REBT.\nIdea clave: Una norma de cables, una de verificación y una de certificación no resuelven la misma duda.\nComprobación: La UNE-HD 60364-6; debe contrastarse con la edición referenciada aplicable.\nConfusión frecuente: Una referencia antigua impresa dentro de una ITC no permite ignorar el listado actualizado. No inventes tablas UNE no consultadas.",
          "references": [
            {
              "label": "ITC-BT-02 · listado y notas; REBT · arts. 23, 26 y 29",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-2"
            }
          ]
        }
      ]
    },
    {
      "id": "bt03",
      "title": "Empresas e instaladores",
      "cards": [
        {
          "id": "categorias",
          "title": "1. Básica y especialista: hasta dónde llega cada una",
          "text": "IBTB / IBTE · generación ≥10 kW: especialista\nLa categoría IBTB, básica, cubre las instalaciones no reservadas a especialista. La categoría IBTE incluye los ámbitos especialistas que se hayan acreditado.\nPara generadoras, el umbral de especialidad es ≥10 kW. Una generadora inferior a 10 kW no queda reservada por este criterio, sin olvidar otros requisitos que puedan concurrir.\nIBTE9 es la etiqueta CEG utilizada en este curso; no es un código oficial del BOE. ASELAR emplea ICBTB e ICBTE-IG≥10 kW. Acreditar generación no otorga automáticamente distribución, explosión, quirófanos o automatización.\nAtención: especialista ≥10 kW y proyecto >10 kW son umbrales diferentes.\nIdea clave: Generación de 10 kW o más pertenece al alcance especialista correspondiente.\nComprobación: Sí. BT-03 utiliza superior o igual a 10 kW.\nConfusión frecuente: Especialista ≥10 kW no es el mismo umbral que proyecto de generador >10 kW.",
          "references": [
            {
              "label": "ITC-BT-03 · §3.1–3.2",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-3"
            }
          ]
        },
        {
          "id": "persona",
          "title": "2. Certificación personal y empresa habilitada",
          "text": "Certificado de persona ≠ habilitación empresarial\nLa persona instaladora debe acreditar su competencia por una de las vías de BT-03 §4. La vía prevista en este curso es la certificación por entidad acreditada conforme a UNE-EN ISO/IEC 17024.\nLa empresa instaladora presenta una declaración responsable ante el órgano competente de la comunidad autónoma y cumple los requisitos humanos, técnicos y de garantía. La persona ejerce su actividad en el seno de esa empresa habilitada.\nNo confundas tres documentos: certificado de competencia de la persona, habilitación de la empresa y CIE de una instalación concreta.\nIdea clave: Aprobar acredita competencia; la actividad se ejerce dentro de una empresa habilitada.\nComprobación: No. La empresa debe cumplir sus requisitos y presentar la declaración responsable correspondiente.\nConfusión frecuente: El certificado personal no sustituye el CIE de una instalación ni los requisitos de la empresa.",
          "references": [
            {
              "label": "ITC-BT-03 · §2, §4 y §5",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-3"
            }
          ]
        },
        {
          "id": "seguro",
          "title": "3. Garantía y equipos de la empresa",
          "text": "600.000 € básica · 900.000 € especialista\nBT-03 establece seguro de responsabilidad civil profesional o garantía equivalente con mínimos por siniestro: 600.000 € para básica y 900.000 € para especialista. No son tasas del examen ni cuotas del curso.\nLos medios del apéndice I permiten efectuar mediciones y trabajos: aislamiento, tierra, continuidad, diferenciales, bucle y demás equipos según categoría. Hay que consultar el listado aplicable completo.\nDistingue los recursos de preparación del alumno de los medios reglamentarios que debe tener la empresa para ejercer.\nIdea clave: La garantía se exige por siniestro; los medios permiten verificar la instalación.\nComprobación: 600.000 €; para especialista, 900.000 €.\nConfusión frecuente: No confundas importe por siniestro con cuota anual ni medios del alumno con medios de la empresa.",
          "references": [
            {
              "label": "ITC-BT-03 · §5.8.c y apéndice I",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-3"
            }
          ]
        },
        {
          "id": "v3-bt03-8",
          "title": "4. Elegir el alcance y presentar la declaración",
          "text": "Aprobar certifica una competencia; ejecutar exige actuar dentro de una empresa habilitada.\nPara clasificar una generadora, compara la potencia con 10 kW: por debajo no queda reservada por ese criterio; con 10 kW exactos o más corresponde la modalidad especialista de generación.\nLas especialidades no se intercambian. Una empresa con alcance de generación no obtiene automáticamente el de locales con riesgo de explosión o quirófanos.\nLa declaración responsable se presenta ante la comunidad autónoma. Un alta comercial o un certificado del curso no la sustituyen.\nIdea clave: Cada modalidad especialista tiene su propio alcance.\nComprobación: Ante el órgano competente de la comunidad autónoma, en los términos de BT-03.\nConfusión frecuente: 10 kW exactos es especialista; no confundas IBTE9, etiqueta del curso, con la denominación legal IBTE.",
          "references": [
            {
              "label": "ITC-BT-03 · §§2, 3, 4, 5, 7 y apéndices I–II",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-3"
            }
          ]
        },
        {
          "id": "v3-bt03-9",
          "title": "5. Requisitos que deben cumplirse juntos",
          "text": "Aprobar certifica una competencia; ejecutar exige actuar dentro de una empresa habilitada.\nLa persona debe actuar dentro de una empresa instaladora habilitada. La competencia individual y los requisitos empresariales se comprueban por separado.\nPara el examen, relaciona básica → 600.000 € y especialista → 900.000 € de garantía mínima por siniestro. No cambies la unidad del requisito a «por instalación» ni a «por año».\nEjemplo: haber aprobado la certificación no demuestra que una empresa tenga la garantía o los equipos de medición exigidos.\nIdea clave: Cualificación personal, empresa habilitada y garantía son requisitos complementarios.\nComprobación: Por siniestro, con el mínimo reglamentario de 900.000 €.\nConfusión frecuente: 10 kW exactos es especialista; no confundas IBTE9, etiqueta del curso, con la denominación legal IBTE.",
          "references": [
            {
              "label": "ITC-BT-03 · §§2, 3, 4, 5, 7 y apéndices I–II",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-3"
            }
          ]
        }
      ]
    },
    {
      "id": "bt04",
      "title": "Documentación y puesta en servicio",
      "cards": [
        {
          "id": "proyecto",
          "title": "1. Cuándo se necesita proyecto",
          "text": "Generadores >10 kW · vivienda unifamiliar >50 kW\nLa tabla resume algunos supuestos de BT-04, no su listado completo. «>» significa mayor que: 10 kW exactos no superan un umbral de >10 kW.\nOtros casos importantes: aparcamiento con ventilación natural de más de cinco plazas; redes de distribución; riesgo de incendio o explosión; quirófanos, entre otros supuestos. Las ampliaciones y modificaciones se revisan con §3.2.\nEjemplo: una generadora de 10 kW exige el alcance especialista por BT-03, pero no supera por potencia el umbral >10 kW de proyecto. Otro supuesto concurrente sí podría exigirlo.\nSupuesto seleccionado | Proyecto | \nIndustria general | >20 kW | \nGeneradores/convertidores; locales mojados | >10 kW | \nEdificio viviendas/locales/oficinas no LPC | >100 kW por CGP | \nUnifamiliar / temporal de obra | >50 kW | \nExterior / piscinas-fuentes | >5 kW | \nPública concurrencia / garaje forzado | Sin límite |\nIdea clave: Comprueba el uso y todos los supuestos aplicables, no solo la potencia.\nComprobación: Sí. Ese supuesto de BT-04 no tiene límite de potencia.\nConfusión frecuente: Proyecto de generador >10 kW no es especialista ≥10 kW.",
          "references": [
            {
              "label": "ITC-BT-04 · §3.1 tabla y §3.2",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-4"
            }
          ]
        },
        {
          "id": "mtd",
          "title": "2. MTD, CIE y orden de tramitación",
          "text": "Sin proyecto no significa sin documentación\nSi no se requiere proyecto, se realiza Memoria Técnica de Diseño (MTD). El proyecto lo redacta y firma un técnico titulado competente; la MTD se firma por la empresa instaladora de la categoría correspondiente o por técnico titulado competente, en los términos de BT-04.\nEl Certificado de Instalación Eléctrica (CIE) acredita la ejecución conforme. No es el proyecto, la MTD ni el certificado de competencia de una persona.\nSecuencia: documentación de diseño → ejecución → verificaciones → inspección inicial si procede → documentación y puesta en servicio por el procedimiento aplicable en la comunidad autónoma.\nIdea clave: Sin proyecto sigue habiendo diseño, verificaciones y documentación.\nComprobación: La Memoria Técnica de Diseño (MTD), con el contenido y autoría reglamentarios.\nConfusión frecuente: No confundas la MTD con el certificado de instalación ni con el certificado de persona.",
          "references": [
            {
              "label": "ITC-BT-04 · §2, §4–6",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-4"
            }
          ]
        },
        {
          "id": "v3-bt04-10",
          "title": "3. Quién firma y cómo leer el umbral",
          "text": "La necesidad de proyecto depende del uso, la potencia y las circunstancias.\nProyecto: lo redacta y firma un técnico titulado competente.\nMTD: la firma la empresa instaladora para la categoría correspondiente o el técnico titulado competente, conforme a BT-04.\nGeneradoras: proyecto por este criterio cuando P >10 kW.\nAprobar la certificación de instalador no confiere automáticamente la competencia para firmar cualquier proyecto. Un dibujo sin cálculos ni responsable tampoco sustituye la MTD.\nNo traslades el símbolo ≥ de la categoría especialista al símbolo > del umbral de proyecto.\nIdea clave: El documento y la competencia de quien lo firma se eligen antes de ejecutar.\nComprobación: No. Mayor que 10 kW excluye la igualdad; deben comprobarse los demás supuestos.\nConfusión frecuente: Mayor que no incluye igualdad. Proyecto y examen de especialista utilizan umbrales diferentes.",
          "references": [
            {
              "label": "ITC-BT-04 · §§2, 3.1, 3.2, 4 y 5",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-4"
            }
          ]
        },
        {
          "id": "v3-bt04-11",
          "title": "4. Cuando coinciden varios motivos de proyecto",
          "text": "La necesidad de proyecto depende del uso, la potencia y las circunstancias.\nEn pública concurrencia se requiere proyecto sin límite de potencia. En alumbrado exterior, el criterio resumido es potencia superior a 5 kW.\nUna instalación puede pertenecer a varios grupos. Comprueba todos los aplicables: estar por debajo de un umbral no anula la exigencia que nace de otro uso o circunstancia.\nEjemplo: un local de pública concurrencia no queda exento de proyecto porque tenga menos de 20 kW. Ese valor corresponde a otro supuesto, no al de pública concurrencia.\nIdea clave: Una obligación por el uso no desaparece porque la potencia esté bajo otro umbral.\nComprobación: No por ese criterio. Hay que revisar si concurre algún otro supuesto de proyecto.\nConfusión frecuente: Mayor que no incluye igualdad. Proyecto y examen de especialista utilizan umbrales diferentes.",
          "references": [
            {
              "label": "ITC-BT-04 · §§2, 3.1, 3.2, 4 y 5",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-4"
            }
          ]
        }
      ]
    },
    {
      "id": "bt05",
      "title": "Verificaciones e inspecciones",
      "cards": [
        {
          "id": "inicial",
          "title": "1. Qué instalaciones pasan inspección inicial",
          "text": "Verifica la empresa · inspecciona el organismo de control\nLa empresa instaladora verifica su trabajo antes de la puesta en servicio. Un organismo de control realiza la inspección inicial cuando BT-05 la exige.\nNo uses la tabla de proyecto como si fuera la de inspección: sus umbrales difieren. En riesgo de incendio o explosión de clase I, la excepción del listado afecta a aparcamientos o estacionamientos de menos de 25 plazas. La tabla siguiente resume supuestos; lee el apartado completo.\nCaso seleccionado | Inspección inicial | \nIndustria con proyecto | >100 kW instalados | \nPública concurrencia / quirófanos | Sí | \nRiesgo clase I | Sí; excepción garajes Local mojado | >25 kW | \nPiscina | >10 kW | \nAlumbrado exterior | >5 kW | \nVE | Si exige proyecto |\nIdea clave: La verificación de la empresa no sustituye la inspección reglamentaria.\nComprobación: Sí, en el supuesto de BT-05 §4.1.\nConfusión frecuente: Los umbrales de proyecto e inspección no coinciden en todos los casos.",
          "references": [
            {
              "label": "ITC-BT-05 · §2–4.1",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-5"
            }
          ]
        },
        {
          "id": "periodicas",
          "title": "2. Inspecciones: cinco años o diez años",
          "text": "5 años / 10 años en supuestos distintos\nCada 5 años: instalaciones que precisaron inspección inicial según BT-05 §4.1.\nCada 10 años: instalaciones comunes de edificios de viviendas de potencia total instalada superior a 100 kW.\nLa segunda regla no significa «todas las viviendas individuales cada diez años». Clasifica las zonas y los usos: un local de pública concurrencia del edificio tiene sus propias condiciones.\nIdea clave: El periodo depende de la instalación, no de que exista una vivienda cerca.\nComprobación: 10 años en ese supuesto específico, sin ignorar otros usos concurrentes.\nConfusión frecuente: No memorices «toda vivienda cada diez años» ni «todo edificio cada cinco».",
          "references": [
            {
              "label": "ITC-BT-05 · §4.2",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-5"
            }
          ]
        },
        {
          "id": "defectos",
          "title": "3. Qué significa el resultado de la inspección",
          "text": "Favorable · condicionada · negativa\nFavorable: sin defectos graves ni muy graves; puede incluir leves.\nCondicionada: al menos un grave o un leve de una inspección anterior no corregido.\nNegativa: al menos un defecto muy grave.\nUna instalación nueva condicionada no se pone en servicio hasta corregir y obtener resultado favorable. Para una existente condicionada, el plazo de corrección del supuesto de §5.2.2 no supera seis meses.\nNo conviertas un plazo de corrección de una instalación existente en permiso para estrenar una instalación nueva con defectos graves.\nIdea clave: Un defecto muy grave conduce a una calificación negativa.\nComprobación: Sí, si no hay defectos graves ni muy graves, en las condiciones de BT-05.\nConfusión frecuente: Favorable no equivale necesariamente a cero defectos.",
          "references": [
            {
              "label": "ITC-BT-05 · §5.2 y §6",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-5"
            }
          ]
        },
        {
          "id": "v3-bt05-12",
          "title": "4. Quién verifica y quién inspecciona",
          "text": "El instalador verifica; el organismo de control realiza las inspecciones reglamentarias.\nLa verificación forma parte de la ejecución y corresponde a la empresa instaladora. La inspección reglamentaria la realiza un organismo de control habilitado para ese campo.\nRecuerda la asociación: inicial exigida → periódica de 5 años; instalaciones comunes de edificio de viviendas >100 kW → supuesto específico de 10 años.\nEjemplo: que un organismo de control vaya a inspeccionar no permite omitir la medición y comprobación previa de la empresa.\nIdea clave: La inspección no libera a la empresa de verificar su instalación.\nComprobación: La empresa instaladora que la ejecuta, sin perjuicio de la inspección cuando proceda.\nConfusión frecuente: Favorable puede contener defectos leves. Una instalación nueva condicionada no se pone en servicio.",
          "references": [
            {
              "label": "ITC-BT-05 · §§2, 3, 4, 5 y 6",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-5"
            }
          ]
        },
        {
          "id": "v3-bt05-13",
          "title": "5. Defectos y autorización de servicio",
          "text": "El instalador verifica; el organismo de control realiza las inspecciones reglamentarias.\nUn defecto muy grave da resultado negativo. Un defecto grave conduce al resultado condicionado en los términos de BT-05.\nEn una instalación nueva, un resultado condicionado impide la puesta en servicio hasta corregir y obtener resultado favorable. Los plazos previstos para ciertos casos existentes no modifican esa regla.\nEstudia siempre en pareja: gravedad del defecto + situación nueva o existente. La palabra «favorable» tampoco significa necesariamente ausencia de leves.\nIdea clave: Una instalación nueva con resultado condicionado debe corregirse antes de entrar en servicio.\nComprobación: Negativo. No se compensa con el resto de comprobaciones correctas.\nConfusión frecuente: Favorable puede contener defectos leves. Una instalación nueva condicionada no se pone en servicio.",
          "references": [
            {
              "label": "ITC-BT-05 · §§2, 3, 4, 5 y 6",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-5"
            }
          ]
        }
      ]
    },
    {
      "id": "bt06",
      "title": "Redes aéreas de distribución",
      "cards": [
        {
          "id": "v3-bt06-14",
          "title": "1. Qué exige una línea aérea",
          "text": "Además del cálculo eléctrico, una línea aérea exige cálculo mecánico y distancias.\nBT-06 regula las redes aéreas de distribución de baja tensión: materiales, ejecución, cálculo mecánico e intensidades admisibles. BT-03 reserva las líneas de distribución al alcance especialista correspondiente.\nSe emplean preferentemente conductores aislados. Eso no suprime las condiciones mecánicas ni las separaciones exigidas.\nEl cálculo mecánico contempla tracción, flecha, peso propio, viento y otras acciones aplicables. Un cable puede cumplir térmicamente y fallar por esfuerzo o distancia al suelo.\nIdea clave: Una línea aérea necesita comprobar electricidad, mecánica y distancias.\nComprobación: No. Distribución es otro alcance especialista de BT-03.\nConfusión frecuente: Esta es otra modalidad especialista, no la de generadoras. Una altura aislada no resuelve todos los cruzamientos.",
          "references": [
            {
              "label": "ITC-BT-06 · §§1, 2, 3 y 4; ITC-BT-03 · §3.2",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-6"
            }
          ]
        },
        {
          "id": "v3-bt06-15",
          "title": "2. Flecha, cruces y empalmes",
          "text": "Además del cálculo eléctrico, una línea aérea exige cálculo mecánico y distancias.\nEl vano es el tramo entre apoyos; la flecha, la desviación vertical del conductor. No son una sección ni una corriente.\nPara el supuesto de cruce de carretera estudiado, la altura mínima es 6 m. No extiendas esa cifra a todos los cruces, proximidades o trazados.\nUn empalme necesita continuidad eléctrica y las condiciones mecánicas exigibles. Cerca de arbolado se comprueban separaciones y medidas que eviten contacto; que el cable esté aislado no elimina esa revisión.\nIdea clave: La distancia debe cumplirse con el conductor en su posición de cálculo.\nComprobación: Su desviación vertical en el vano, que condiciona la altura y las distancias.\nConfusión frecuente: Esta es otra modalidad especialista, no la de generadoras. Una altura aislada no resuelve todos los cruzamientos.",
          "references": [
            {
              "label": "ITC-BT-06 · §§1, 2, 3 y 4; ITC-BT-03 · §3.2",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-6"
            }
          ]
        },
        {
          "id": "v3-bt06-16",
          "title": "3. Intensidad admisible y proyecto",
          "text": "Además del cálculo eléctrico, una línea aérea exige cálculo mecánico y distancias.\nPara la intensidad admisible identifica tipo de conductor, material, aislamiento y condiciones de instalación. El valor de una tabla no se copia a otro montaje sin verificar sus condiciones.\nLas redes de distribución están en el supuesto de proyecto sin límite de potencia de BT-04. La documentación y la categoría habilitante se comprueban por separado.\nEjemplo: una red de pequeña potencia sigue necesitando proyecto por su uso; no se clasifica como una línea interior de vivienda.\nIdea clave: La tabla eléctrica y la obligación de proyecto son comprobaciones distintas.\nComprobación: No. BT-04 incluye ese supuesto sin límite de potencia.\nConfusión frecuente: Esta es otra modalidad especialista, no la de generadoras. Una altura aislada no resuelve todos los cruzamientos.",
          "references": [
            {
              "label": "ITC-BT-06 · §§1, 2, 3 y 4; ITC-BT-03 · §3.2",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-6"
            }
          ]
        }
      ]
    },
    {
      "id": "bt07",
      "title": "Redes subterráneas de distribución",
      "cards": [
        {
          "id": "v3-bt07-17",
          "title": "1. Profundidad de un cable directamente enterrado",
          "text": "Profundidad, servicios próximos y disipación térmica se comprueban por separado.\nBT-07 trata redes subterráneas de distribución. Otras ITC pueden remitirse a ella, manteniendo sus particularidades.\nPara cables directamente enterrados: mínimo de 0,60 m en acera y 0,80 m en calzada, medidos hasta la parte inferior del cable. Lee también las condiciones de cruzamiento y las excepciones.\nNo copies estos valores al alumbrado exterior: BT-09 tiene su prescripción para tubos y una referencia de medida diferente.\nIdea clave: En este supuesto, la profundidad se mide hasta la parte inferior del cable.\nComprobación: 0,80 m hasta la parte inferior del cable, sujeto a las condiciones de BT-07.\nConfusión frecuente: 0,60 m en acera y 0,80 m en calzada son del supuesto directamente enterrado; no los copies a alumbrado exterior ni a cualquier cruce.",
          "references": [
            {
              "label": "ITC-BT-07 · §§1, 2.1, 2.2 y 3; ITC-BT-03 · §3.2; ITC-BT-04 · §3.1.j",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-7"
            }
          ]
        },
        {
          "id": "v3-bt07-18",
          "title": "2. Terreno, agrupación y cables en paralelo",
          "text": "Profundidad, servicios próximos y disipación térmica se comprueban por separado.\nSi un impedimento no permite la profundidad prescrita, la reducción solo procede con las protecciones mecánicas suficientes admitidas y las demás condiciones del caso. No es una reducción libre.\nLa disipación térmica del terreno, la separación y la disposición de los cables afectan a su capacidad de carga. La agrupación puede exigir factores por calentamiento mutuo.\nEn conductores en paralelo se comprueba el reparto de corriente: material, sección, longitud e instalación influyen en su impedancia. Sumar secciones no basta para demostrar un reparto adecuado.\nIdea clave: La misma sección puede admitir distinta corriente según cómo evacúe calor.\nComprobación: Por su calentamiento mutuo y las condiciones de disipación del conjunto.\nConfusión frecuente: 0,60 m en acera y 0,80 m en calzada son del supuesto directamente enterrado; no los copies a alumbrado exterior ni a cualquier cruce.",
          "references": [
            {
              "label": "ITC-BT-07 · §§1, 2.1, 2.2 y 3; ITC-BT-03 · §3.2; ITC-BT-04 · §3.1.j",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-7"
            }
          ]
        },
        {
          "id": "v3-bt07-19",
          "title": "3. Servicios próximos y alcance profesional",
          "text": "Profundidad, servicios próximos y disipación térmica se comprueban por separado.\nBT-07 distingue cruzamientos, proximidades y paralelismos. Identifica primero el otro servicio —electricidad, telecomunicaciones, agua o gas— y después sus distancias y protecciones.\nLas redes de distribución requieren el alcance especialista de distribución y proyecto en el supuesto de BT-04, sin límite de potencia. No lo confundas con especialidad de generación.\nUna profundidad correcta no demuestra por sí sola que se cumplan las separaciones respecto de otros servicios.\nIdea clave: Cada cruce o paralelismo tiene condiciones propias.\nComprobación: En el apartado de cruzamientos aplicable de BT-07, con sus distancias y protecciones.\nConfusión frecuente: 0,60 m en acera y 0,80 m en calzada son del supuesto directamente enterrado; no los copies a alumbrado exterior ni a cualquier cruce.",
          "references": [
            {
              "label": "ITC-BT-07 · §§1, 2.1, 2.2 y 3; ITC-BT-03 · §3.2; ITC-BT-04 · §3.1.j",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-7"
            }
          ]
        }
      ]
    },
    {
      "id": "bt08",
      "title": "Esquemas de neutro y masas",
      "cards": [
        {
          "id": "esquemas",
          "title": "1. Comparar TT, TN e IT",
          "text": "Primera letra: fuente · segunda: masas\nTT: alimentación conectada a tierra y masas a una toma de tierra propia, en los términos del esquema.\nTN: masas unidas al punto de la alimentación puesto a tierra mediante conductores de protección.\nIT: alimentación aislada de tierra o conectada por impedancia, con masas puestas a tierra.\nEn TN-S las funciones N y PE están separadas; en TN-C se combinan en PEN; TN-C-S combina un tramo y las separa después. No se aplica un diferencial al tramo TN-C como si existiera un PE separado.\nEn IT, el primer defecto puede permitir continuidad bajo las condiciones de protección y vigilancia. No significa que los defectos puedan ignorarse.\nIdea clave: Primera letra: alimentación; segunda: masas.\nComprobación: No. Ese puente no corresponde al esquema TT previsto.\nConfusión frecuente: TT no significa unir neutro y PE en el cuadro. No se instala un diferencial en el tramo TN-C como si N y PE estuvieran separados.",
          "references": [
            {
              "label": "ITC-BT-08 · §1",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-8"
            },
            {
              "label": "ITC-BT-24 · §4.1",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-24"
            }
          ]
        },
        {
          "id": "v3-bt08-20",
          "title": "2. Leer las letras sin memorizarlas a ciegas",
          "text": "La primera letra mira a la fuente; la segunda, a las masas.\nLa primera letra se refiere a la alimentación: T, un punto directamente a tierra; I, aislamiento de tierra o conexión mediante impedancia.\nLa segunda letra se refiere a las masas: T, conexión a tierra; N, conexión al punto de la alimentación puesto a tierra.\nTruco de comprensión: lee el esquema de izquierda a derecha: primero la fuente, después lo que proteges. Los colores de un cable, por sí solos, no determinan el esquema.\nIdea clave: Las dos letras describen relaciones diferentes con tierra.\nComprobación: Alimentación aislada de tierra o conectada a ella mediante impedancia; no masas sin protección.\nConfusión frecuente: No deduzcas TT o TN por el color de un conductor. PEN no equivale a PE separado.",
          "references": [
            {
              "label": "ITC-BT-08 · §1; ITC-BT-24 · §4.1",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-8"
            }
          ]
        },
        {
          "id": "v3-bt08-21",
          "title": "3. N y PE separados o combinados",
          "text": "La primera letra mira a la fuente; la segunda, a las masas.\nS significa funciones separadas y C, combinadas. TN-S no es lo mismo que TT: en TN las masas se conectan al punto de la alimentación puesto a tierra.\nEn TN-C no se utilizan diferenciales como si N y PE fueran independientes. En un esquema IT, la posible continuidad tras el primer defecto exige vigilancia y medidas contra situaciones peligrosas posteriores.\nNo cambies el sistema definido mediante un puente improvisado entre neutro y protección. La conexión y las protecciones tienen que corresponder al esquema real.\nIdea clave: PEN combina funciones; PE separado no lleva la corriente normal de neutro.\nComprobación: TN-S separa N y PE; TN-C combina ambas funciones en PEN.\nConfusión frecuente: No deduzcas TT o TN por el color de un conductor. PEN no equivale a PE separado.",
          "references": [
            {
              "label": "ITC-BT-08 · §1; ITC-BT-24 · §4.1",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-8"
            }
          ]
        }
      ]
    },
    {
      "id": "bt09",
      "title": "Alumbrado exterior",
      "cards": [
        {
          "id": "exterior",
          "title": "1. Los tramos del alumbrado exterior",
          "text": "También en dominio privado\nBT-09 comprende los espacios exteriores de los usos indicados, tanto públicos como privados. Una instalación privada no queda exenta por ese motivo.\nRed subterránea: mínimo de cobre de 6 mm², incluido neutro según las condiciones de la ITC.\nRed aérea: mínimo de 4 mm², con las condiciones del apartado.\nInterior de soportes: cobre de 2,5 mm² como mínimo y cable 0,6/1 kV.\nCada punto de luz debe tener factor de potencia corregido a ≥0,90. Proyecto e inspección inicial aparecen por el criterio >5 kW; además se revisan tierras, masas y protecciones.\nIdea clave: Red enterrada, red aérea e interior del soporte tienen mínimos diferentes.\nComprobación: No. La red subterránea tiene su mínimo específico de 6 mm² de cobre.\nConfusión frecuente: No aplicar el mínimo interior de columna a toda la red enterrada.",
          "references": [
            {
              "label": "ITC-BT-09 · §1, §5.2, §6.2, §8–10",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-9"
            },
            {
              "label": "ITC-BT-04 · §3.1.k",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-4"
            },
            {
              "label": "ITC-BT-05 · §4.1.g",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-5"
            }
          ]
        },
        {
          "id": "luminotecnia",
          "title": "2. Lúmenes, lux y candelas",
          "text": "Lumen flujo · lux iluminancia · candela intensidad\nLumen (lm): flujo luminoso.\nLux (lx): iluminancia, equivalente a lm/m².\nCandela (cd): intensidad luminosa en una dirección.\nlm/W: eficacia luminosa, luz producida por potencia.\nPara un modelo uniforme de ejercicio: E_media ≈ N·Φ·FU·FM/A. N es número de lámparas, Φ su flujo, FU el factor de utilización, FM el de mantenimiento y A la superficie.\nEs una aproximación didáctica. Un diseño completo también comprueba distribución y uniformidad con el método fotométrico aplicable. Dividir W entre m² no da lux.\nIdea clave: Los lux expresan flujo luminoso recibido por superficie.\nComprobación: 100 lx, suponiendo que todo ese flujo llega a la superficie.\nConfusión frecuente: Dividir vatios entre m² no produce lux: necesitas flujo luminoso.",
          "references": [
            {
              "label": "Electrotecnia · desarrollo didáctico propio, no texto literal REBT",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-3"
            },
            {
              "label": "ITC-BT-28 · §3.1",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-28"
            }
          ]
        },
        {
          "id": "v3-bt09-22",
          "title": "3. Mínimos de cable y compensación",
          "text": "Distingue red enterrada, red aérea, interior del soporte y cada punto de luz.\nLa red enterrada utiliza mínimo de 6 mm²; la aérea, de 4 mm². El cálculo y las condiciones pueden exigir más. El interior del soporte tiene otro mínimo y no sirve para sustituir al de la red.\nEl factor de potencia se corrige a ≥0,90 por punto de luz. No lo sustituyas por una media elegida del conjunto.\nClasifica el uso antes de aplicar BT-09: el dominio privado no cambia por sí solo su campo de aplicación.\nIdea clave: No uses un mínimo de otro tramo aunque pertenezca a la misma instalación.\nComprobación: A 0,90, según BT-09 §3.\nConfusión frecuente: Un mínimo de 2,5 mm² dentro del soporte no vale automáticamente para la red enterrada de 6 mm².",
          "references": [
            {
              "label": "ITC-BT-09 · §§3, 5.1, 5.2, 6.2, 8 y 10",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-9"
            }
          ]
        },
        {
          "id": "v3-bt09-23",
          "title": "4. Neutros, tubos y lámparas de descarga",
          "text": "Distingue red enterrada, red aérea, interior del soporte y cada punto de luz.\nCada circuito que parte del cuadro tiene su neutro propio; no puede usarse por otro circuito.\nEn el supuesto de BT-09 §5.2.1, los tubos quedan enterrados como mínimo 0,40 m medidos hasta su cota inferior. Lee también las condiciones adicionales de cruces y canalización.\nPara lámparas o tubos de descarga, BT-09 §3 considera potencia aparente mínima en VA de 1,8 veces la potencia en W de las lámparas, salvo el coeficiente calculado con las cargas y condiciones conocidas del apartado. No es el coeficiente de simultaneidad de viviendas ni una regla general para cualquier LED.\nIdea clave: Neutro propio, referencia de profundidad y carga aparente se comprueban por separado.\nComprobación: Desde el nivel del suelo hasta la cota inferior del tubo.\nConfusión frecuente: Un mínimo de 2,5 mm² dentro del soporte no vale automáticamente para la red enterrada de 6 mm².",
          "references": [
            {
              "label": "ITC-BT-09 · §§3, 5.1, 5.2, 6.2, 8 y 10",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-9"
            }
          ]
        }
      ]
    },
    {
      "id": "bt10",
      "title": "Previsión de cargas",
      "cards": [
        {
          "id": "electrificacion",
          "title": "1. Básica y elevada en viviendas",
          "text": "Básica 5.750 W · elevada 9.200 W\nA 230 V, la previsión mínima es 5.750 W para básica y 9.200 W para elevada. Sus IGA de referencia son 25 A y 40 A. Son mínimos; la demanda prevista puede ser mayor.\nElevada corresponde, entre otros supuestos, a superficie útil >160 m², calefacción eléctrica, aire acondicionado, utilización superior a básica o recarga de VE en vivienda unifamiliar.\nEjemplo: una vivienda de 150 m² con previsión de calefacción eléctrica puede requerir elevada aunque no supere el umbral de superficie. No sustituyas previsión por contrato.\nIdea clave: La previsión de potencia no es necesariamente la potencia contratada.\nComprobación: No. El criterio de superficie es útil superior a 160 m²; puede haber otros motivos.\nConfusión frecuente: 160 m² exactos no fuerzan elevada solo por superficie. 14.490 W no es el mínimo de previsión de una vivienda.",
          "references": [
            {
              "label": "ITC-BT-10 · §2.1–2.2 y §6",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-10"
            }
          ]
        },
        {
          "id": "viviendas",
          "title": "2. Simultaneidad de varias viviendas",
          "text": "P_viv=C_s(n)·potencia media\nPara n viviendas: suma sus potencias previstas, divide entre n y multiplica por C_s(n). Si todas son iguales, utiliza esa potencia común: P_viv = C_s·P_media.\nEjemplo: cuatro viviendas de 5,75 kW tienen media de 5,75 kW; con C_s = 3,8, la previsión conjunta es 21,85 kW. No multipliques 3,8 por la suma de 23 kW.\nPara n >21: C_s = 15,3 + 0,5(n − 21). En el supuesto de tarifa nocturna contemplado en el texto se usa C_s = n. Este coeficiente se aplica al conjunto de viviendas, no a servicios, locales ni al edificio entero.\nn | C_s | n | C_s | n | C_s | \n1 | 1 | 8 | 7 | 15 | 11.9 | \n2 | 2 | 9 | 7.8 | 16 | 12.5 | \n3 | 3 | 10 | 8.5 | 17 | 13.1 | \n4 | 3.8 | 11 | 9.2 | 18 | 13.7 | \n5 | 4.6 | 12 | 9.9 | 19 | 14.3 | \n6 | 5.4 | 13 | 10.6 | 20 | 14.8 | \n7 | 6.2 | 14 | 11.3 | 21 | 15.3 |\nIdea clave: El coeficiente tabulado multiplica la potencia media, no la suma.\nComprobación: 21,85 kW: 3,8 × 5,75.\nConfusión frecuente: No multipliques C_s por la suma de todas las viviendas. Se multiplica por la media.",
          "references": [
            {
              "label": "ITC-BT-10 · §3.1, tabla 1",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-10"
            }
          ]
        },
        {
          "id": "sg",
          "title": "3. Servicios generales y recargos de clase",
          "text": "SG sin reducción de simultaneidad\nSuma los servicios generales: ascensores, bombas, alumbrado y demás servicios. Se considera sin reducción por simultaneidad en este supuesto. Si el enunciado da W de alumbrado, RITI o RITS, usa esos W; no los conviertas en motores.\nConvención CEG de estas hojas: CV ×736; bombas, grupos y motores ×1,25; ascensores ×1,3. Aplica cada recargo solo donde el ejercicio lo haya establecido.\nBT-47 §3 trata conductores de motores y §6 utiliza 1,3 en el contexto de la intensidad de ascensores para arranque. Trasladar esa cifra a potencia prevista es la convención didáctica indicada, no una regla universal literal de BT-10.\nIdea clave: Los recargos CEG son convenciones del ejercicio, no un C_s del edificio.\nComprobación: 2 × 736 × 1,25 = 1.840 W, como convención de esas hojas.\nConfusión frecuente: No presentes los recargos de clase como una regla universal literal de BT-10. En varios motores de una línea, lee la regla específica de BT-47.",
          "references": [
            {
              "label": "ITC-BT-10 · §3.2",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-10"
            },
            {
              "label": "ITC-BT-47 · §3 y §6",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-47"
            },
            {
              "label": "Criterio CEG comunicado en el briefing del alumno, 28/09/2026",
              "url": "#fuentes"
            }
          ]
        },
        {
          "id": "ascensor",
          "title": "4. Leer la tabla CEG de ascensores",
          "text": "ITA-1 4,5 · ITA-2 7,5 · ITA-3 11,5 kW\nEsta es una tabla de referencia CEG para ejercicios, no una tabla propia de BT-10. Identifica tipo, personas o carga y velocidad antes de elegir potencia.\nEn las hojas acordadas se aplica después ×1,3. Si el tipo se indica claramente, usa su fila. Para el supuesto sin velocidad y con igual capacidad, la indicación del profesor es elegir la menor; una anotación ambigua debe aclararse.\nTipo | Personas / carga | Velocidad | Potencia | \nITA-1 | 5 / 400 kg | 0,63 m/s | 4,5 kW | \nITA-2 | 5 / 400 kg | 1 m/s | 7,5 kW | \nITA-3 | 8 / 630 kg | 1 m/s | 11,5 kW |\nIdea clave: Capacidad y velocidad deben leerse juntas para elegir la fila.\nComprobación: No. ITA-1 e ITA-2 tienen esa capacidad; cambia la velocidad y la potencia de referencia.\nConfusión frecuente: Cinco personas no determina ITA-2: ITA-1 y 2 tienen esa capacidad. Esta no es una tabla propia de BT-10.",
          "references": [
            {
              "label": "Criterio CEG comunicado en el briefing del alumno, 28/09/2026",
              "url": "#fuentes"
            }
          ]
        },
        {
          "id": "locales",
          "title": "5. Previsión por cada local u oficina",
          "text": "P=máx(100·A; 3.450; P_real)\nPara el supuesto de locales comerciales y oficinas: P = máximo(100·A, 3.450 W, demanda prevista real), con A en m². Aplica el mínimo a cada local y después suma; simultaneidad 1.\nEjemplo: un local de 50 m² parte de 5.000 W por superficie; si prevés 7.000 W reales, adopta al menos esa demanda.\nEn edificios destinados a concentración de industrias, el criterio es 125 W/m² y planta, mínimo 10.350 W por local. No lo intercambies con comercio y oficinas.\nIdea clave: El mínimo se aplica a cada local antes de sumar.\nComprobación: 6.900 W: cada local tiene su mínimo de 3.450 W.\nConfusión frecuente: Si hay varios locales pequeños, cada uno tiene su mínimo; no se aplica 3.450 W una sola vez al conjunto.",
          "references": [
            {
              "label": "ITC-BT-10 · §3.3 y §4.1–4.2",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-10"
            }
          ]
        },
        {
          "id": "garaje",
          "title": "6. Garaje y recarga: dos previsiones",
          "text": "Natural 10 · forzada 20 W/m² · mínimo 3.450 W\nPara el garaje: 10 W/m² con ventilación natural o 20 W/m² con forzada, con mínimo de 3.450 W y simultaneidad 1. Una demanda prevista mayor se atiende como tal.\nLa recarga de vehículos eléctricos se trata aparte. En el supuesto de nueva construcción, la previsión reglamentaria contempla 3.680 W ×10 % de las plazas.\nEl cálculo y la dotación se completan con BT-52 y sus condiciones de esquema y SPL —sistema de protección de la línea general de alimentación—. No apliques el factor 0,3 por sistema ni confundas el 10 % de previsión con toda la infraestructura exigible.\nIdea clave: La carga de recarga no se da por incluida en ventilación y alumbrado.\nComprobación: No. El mínimo general de ese supuesto es 3.450 W, antes de añadir las necesidades que correspondan.\nConfusión frecuente: Ventilación/alumbrado del garaje y recarga son conceptos distintos. Previsión del 10 % no equivale a toda la dotación física exigible.",
          "references": [
            {
              "label": "ITC-BT-10 · §3.4–3.5",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-10"
            },
            {
              "label": "ITC-BT-52 · §4",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-52"
            }
          ]
        },
        {
          "id": "metodo-cargas",
          "title": "7. Resolver una previsión sin duplicar cargas",
          "text": "Clasificar → mínimos → recargos → C_s → suma\nConvierte los datos a W o kW y mantén una unidad.\nSepara viviendas, servicios generales, locales, garaje y VE.\nCompara la demanda con los mínimos de cada uso.\nAplica recargos CEG solo cuando el ejercicio los establezca.\nAplica C_s a viviendas y el tratamiento de recarga que corresponda.\nSuma sin contar dos veces el mismo receptor.\nComo esquema de trabajo: P_total = P_viv + P_SG + ΣP_locales + P_garaje + P_VE, con las condiciones específicas de simultaneidad de VE. Guarda los subtotales: te permiten localizar un error antes de rehacer la suma.\nIdea clave: Clasifica, aplica mínimos y coeficientes, y suma con una sola unidad.\nComprobación: No. Se aplica al conjunto de viviendas; cada otro uso tiene su tratamiento.\nConfusión frecuente: Una suma correcta no compensa haberse saltado el mínimo de un local o aplicar dos veces el mismo recargo.",
          "references": [
            {
              "label": "ITC-BT-10 · §3–4",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-10"
            },
            {
              "label": "ITC-BT-52 · §4",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-52"
            },
            {
              "label": "Criterio CEG comunicado en el briefing del alumno, 28/09/2026",
              "url": "#fuentes"
            }
          ]
        }
      ]
    },
    {
      "id": "bt11",
      "title": "Acometidas",
      "cards": [
        {
          "id": "v3-bt11-24",
          "title": "1. Dónde empieza y termina la acometida",
          "text": "Red de distribución → acometida → CGP o unidad equivalente.\nLa acometida es el tramo que enlaza la red de distribución con la CGP o unidad funcional equivalente. No es la línea general de alimentación ni la derivación individual.\nPuede ser aérea, subterránea o aero-subterránea. Su trazado no cambia su función ni la convierte en una DI.\nPara el tendido aéreo, BT-11 remite a BT-06 en los aspectos correspondientes, además de sus propias condiciones.\nIdea clave: La acometida viene de la red; la LGA empieza después de la CGP.\nComprobación: No. La instalación de enlace comienza al final de la acometida.\nConfusión frecuente: Acometida no es LGA ni DI. El punto de entrega no se identifica por intuición: se lee el esquema.",
          "references": [
            {
              "label": "ITC-BT-11 · §§1.1, 1.2, 1.3 y 1.4",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-11"
            }
          ]
        },
        {
          "id": "v3-bt11-25",
          "title": "2. Dimensionar y escoger el recorrido",
          "text": "Red de distribución → acometida → CGP o unidad equivalente.\nPara acometidas subterráneas se consulta BT-07, junto con las particularidades de BT-11. La sección depende de previsión de cargas y condiciones de suministro, además de las comprobaciones aplicables.\nEl recorrido se busca lo más corto posible dentro de las condiciones de establecimiento y seguridad. No se ignoran obstáculos, accesibilidad o protecciones para acortar unos metros.\nLa caída de tensión de acometida se estudia con las condiciones específicas de la red y la acometida. No copies sin más los porcentajes de LGA y DI.\nIdea clave: La sección se justifica con la carga y las condiciones de suministro.\nComprobación: No. Energía consumida y potencia prevista no son magnitudes intercambiables.\nConfusión frecuente: Acometida no es LGA ni DI. El punto de entrega no se identifica por intuición: se lee el esquema.",
          "references": [
            {
              "label": "ITC-BT-11 · §§1.1, 1.2, 1.3 y 1.4",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-11"
            }
          ]
        },
        {
          "id": "v3-bt11-26",
          "title": "3. Paso sobre vías y unidad equivalente",
          "text": "Red de distribución → acometida → CGP o unidad equivalente.\nEn el supuesto de tendido sobre vías públicas contemplado, recuerda el mínimo de 6 m y comprueba las restantes condiciones aplicables. No uses esa cifra fuera de su contexto.\nLa acometida puede terminar en CGP o unidad funcional equivalente. Si el esquema admite una unidad combinada, no dibujes una caja separada obligatoria solo por costumbre.\nIdea clave: Identifica el supuesto de montaje antes de usar una distancia.\nComprobación: No. La definición admite CGP o unidad funcional equivalente en el esquema previsto.\nConfusión frecuente: Acometida no es LGA ni DI. El punto de entrega no se identifica por intuición: se lee el esquema.",
          "references": [
            {
              "label": "ITC-BT-11 · §§1.1, 1.2, 1.3 y 1.4",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-11"
            }
          ]
        }
      ]
    },
    {
      "id": "bt12",
      "title": "Esquemas de enlace",
      "cards": [
        {
          "id": "cadena",
          "title": "1. Recorrer el esquema de enlace",
          "text": "Acometida → CGP → LGA → contadores → DI → cuadro\nRecorrido habitual: acometida → CGP → LGA → contadores → DI → dispositivos generales del usuario. La acometida es previa al enlace.\nLa LGA es la línea general de alimentación común en los esquemas que la incluyen. La DI es la derivación individual de cada suministro y comprende los elementos definidos en BT-15.\nEn usuario único puede utilizarse una CPM —caja de protección y medida— sin LGA. Las figuras de BT-12 permiten elegir el esquema concreto: no todos tienen la misma cadena.\nIdea clave: Dibuja primero el recorrido; luego asigna nombres y límites a cada tramo.\nComprobación: Sí, en el esquema de usuario único admitido con CPM y sin LGA.\nConfusión frecuente: No dibujes una LGA obligatoria en todos los esquemas ni confundas acometida y DI.",
          "references": [
            {
              "label": "ITC-BT-11 · §1",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-11"
            },
            {
              "label": "ITC-BT-12 · §1–2",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-12"
            },
            {
              "label": "ITC-BT-14 · §1",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-14"
            },
            {
              "label": "ITC-BT-15 · §1",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-15"
            }
          ]
        },
        {
          "id": "v3-bt12-27",
          "title": "2. Límites de la instalación de enlace",
          "text": "Primero identifica cuántos usuarios hay y dónde están los contadores.\nLa instalación de enlace une el final de la acometida con los dispositivos generales de mando y protección de la instalación del usuario. Los circuitos interiores de utilización quedan después.\nLGA significa línea general de alimentación; DI, derivación individual. La DI dispone de los conductores propios de cada suministro.\nSepara función y nombre: un tramo común y un tramo individual no reciben el mismo límite de caída solo por pertenecer al enlace.\nIdea clave: El enlace llega hasta los dispositivos generales; los circuitos interiores van después.\nComprobación: Derivación individual: el recorrido propio del suministro definido en BT-15.\nConfusión frecuente: No todos los esquemas tienen LGA. Acometida no es un elemento del enlace.",
          "references": [
            {
              "label": "ITC-BT-12 · §§1.1, 1.2 y 2; ITC-BT-13 · §2",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-12"
            }
          ]
        },
        {
          "id": "v3-bt12-28",
          "title": "3. Centralización y conservación",
          "text": "Primero identifica cuántos usuarios hay y dónde están los contadores.\nBT-12 contempla esquemas con centralización total o parcial de contadores y otros sin LGA para usuario único. Identifica cuál tienes antes de consultar BT-14 y BT-15.\nLas instalaciones de enlace son propiedad del usuario y tienen obligaciones de conservación. No deduzcas propiedad y responsabilidad solo por estar antes o después del contador.\nLa CGP es la caja general de protección; no equivale al cuadro interior ni incorpora necesariamente medida. La unidad combinada es CPM.\nIdea clave: La disposición de contadores cambia el esquema y sus condiciones.\nComprobación: No. El esquema admitido integra las funciones necesarias, por ejemplo en CPM.\nConfusión frecuente: No todos los esquemas tienen LGA. Acometida no es un elemento del enlace.",
          "references": [
            {
              "label": "ITC-BT-12 · §§1.1, 1.2 y 2; ITC-BT-13 · §2",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-12"
            }
          ]
        },
        {
          "id": "v3-bt12-29",
          "title": "4. Elegir la figura antes de calcular",
          "text": "Primero identifica cuántos usuarios hay y dónde están los contadores.\nIdentifica cuántos suministros hay.\nSitúa contadores: agrupados, en varios lugares o para usuario único.\nElige la figura de BT-12.\nMarca CGP o CPM, LGA si existe y cada DI.\nConsulta los límites de cada tramo en su ITC.\nEste dibujo previo evita inventar una LGA o aplicar a la DI el porcentaje de otro esquema.\nIdea clave: Usuarios y ubicación de contadores determinan el esquema.\nComprobación: Número de usuarios y disposición de los contadores.\nConfusión frecuente: No todos los esquemas tienen LGA. Acometida no es un elemento del enlace.",
          "references": [
            {
              "label": "ITC-BT-12 · §§1.1, 1.2 y 2; ITC-BT-13 · §2",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-12"
            }
          ]
        }
      ]
    },
    {
      "id": "bt13",
      "title": "CGP y cajas de protección y medida",
      "cards": [
        {
          "id": "cgp",
          "title": "1. La función de CGP y CPM",
          "text": "Protección de fases · neutro amovible\nLa CGP aloja los elementos de protección de la LGA. Su ubicación, acceso y características se ajustan a BT-13 y a las especificaciones particulares aprobadas aplicables.\nLos fusibles se sitúan en las fases. El neutro dispone de la conexión amovible prevista; no se protege como otra fase con un fusible independiente.\nLa CPM integra protección y medida en los casos admitidos. Ninguna de estas cajas equivale al cuadro interior del usuario.\nIdea clave: La CGP protege; la CPM combina protección y medida.\nComprobación: No. Protege la LGA y pertenece al enlace.\nConfusión frecuente: No sustituir la conexión de neutro por un fusible independiente que pueda dejar fases alimentadas con neutro abierto.",
          "references": [
            {
              "label": "ITC-BT-13 · §1–2",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-13"
            }
          ]
        },
        {
          "id": "v3-bt13-30",
          "title": "2. Fases protegidas y neutro amovible",
          "text": "La CGP protege la LGA; la CPM combina protección y medida en los supuestos previstos.\nCGP: contiene protección de la línea general de alimentación.\nCPM: caja de protección y medida, que reúne ambas funciones.\nFases: alojan los elementos fusibles correspondientes.\nNeutro: conexión amovible, en la disposición prescrita.\nNo coloques un fusible independiente que pueda abrir solo el neutro y mantener alimentadas las fases. Aprende el esquema completo, no solo cuántos polos ves.\nIdea clave: Fases y neutro no reciben la misma disposición.\nComprobación: Una conexión amovible, con las condiciones reglamentarias; no un fusible independiente como el de fase.\nConfusión frecuente: No coloques un fusible independiente en neutro como si fuera una fase; la CPM no es un cuadro interior.",
          "references": [
            {
              "label": "ITC-BT-13 · §§1.1, 1.2, 2.1 y 2.2",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-13"
            }
          ]
        },
        {
          "id": "v3-bt13-31",
          "title": "3. Ubicación, modelo y coordinación",
          "text": "La CGP protege la LGA; la CPM combina protección y medida en los supuestos previstos.\nLa CGP debe respetar emplazamiento y accesibilidad. Las especificaciones particulares aprobadas concretan modelos y condiciones; una instrucción informal no prevalece sobre el reglamento.\nLa protección debe coordinarse con la carga y la capacidad del conductor. No basta elegir una caja y asumir que cualquier sección sirve.\nProtección y medida son funciones distintas: la CGP no mide necesariamente energía; la CPM las combina en el supuesto admitido.\nIdea clave: Una caja adecuada no justifica por sí sola la sección del cable.\nComprobación: BT-13 y las especificaciones particulares aprobadas aplicables.\nConfusión frecuente: No coloques un fusible independiente en neutro como si fuera una fase; la CPM no es un cuadro interior.",
          "references": [
            {
              "label": "ITC-BT-13 · §§1.1, 1.2, 2.1 y 2.2",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-13"
            }
          ]
        },
        {
          "id": "v3-bt13-32",
          "title": "4. Unidad combinada para usuario único",
          "text": "La CGP protege la LGA; la CPM combina protección y medida en los supuestos previstos.\nPara usuario único, el esquema permitido puede reunir funciones en una CPM. No exige siempre repetir todos los elementos separados de una centralización colectiva.\nLa simplificación conserva protección y medida. Relaciona la solución con la figura de BT-12 y las condiciones de BT-13 antes de dibujar o dimensionar.\nIdea clave: Integrar protección y medida no significa suprimir la protección.\nComprobación: Sí, como unidad combinada de protección y medida, cumpliendo sus condiciones.\nConfusión frecuente: No coloques un fusible independiente en neutro como si fuera una fase; la CPM no es un cuadro interior.",
          "references": [
            {
              "label": "ITC-BT-13 · §§1.1, 1.2, 2.1 y 2.2",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-13"
            }
          ]
        }
      ]
    },
    {
      "id": "bt14",
      "title": "Línea general de alimentación",
      "cards": [
        {
          "id": "lga",
          "title": "1. Mínimos y caída de la LGA",
          "text": "Cu 10 mm² · Al 16 mm² · caída 0,5/1 %\nMínimos de fase: 10 mm² de cobre o 16 mm² de aluminio. Los conductores tienen tensión asignada 0,6/1 kV y las características frente al fuego prescritas.\nCaída máxima de LGA: 0,5 % con contadores totalmente centralizados o 1 % con centralizaciones parciales. Comprueba también capacidad térmica, protección y demás mínimos.\nEjemplo: un límite del 0,5 % sobre una tensión de referencia de 400 V equivale a 2 V. Usa la tensión correspondiente al sistema y al tramo: ΔU = U·porcentaje/100.\nEl neutro se determina con el apartado y tabla aplicables. No supongas que siempre vale la mitad de la fase.\nIdea clave: Una sección mínima es un punto de partida, no el resultado del cálculo.\nComprobación: 0,5 % en el supuesto de BT-14; el de DI se comprueba aparte.\nConfusión frecuente: La sección mínima no es la sección final automática. El neutro no es siempre la mitad.",
          "references": [
            {
              "label": "ITC-BT-14 · §2–3",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-14"
            }
          ]
        },
        {
          "id": "v3-bt14-33",
          "title": "2. Calcular la sección por varias condiciones",
          "text": "S final debe cumplir mínimo, calentamiento, caída y protección.\nLa LGA enlaza la CGP con las derivaciones individuales que alimenta en el esquema correspondiente. No es la acometida ni una DI particular.\nMemoriza los mínimos de fase con el material: Cu 10 mm²; Al 16 mm². Cambiar material no permite conservar automáticamente la misma sección.\nEn centralización total, el límite de caída es 0,5 %. La sección final debe cumplir mínimo + calentamiento + caída + protección, eligiendo un valor normalizado suficiente.\nIdea clave: La sección elegida debe satisfacer todas las comprobaciones a la vez.\nComprobación: No. Es un mínimo de fase; cálculo térmico, caída y protección pueden exigir más.\nConfusión frecuente: 0,5 % en centralización total; 1 % en parcial. El neutro se determina con la tabla, no siempre como S/2.",
          "references": [
            {
              "label": "ITC-BT-14 · §§1, 2 y 3",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-14"
            }
          ]
        },
        {
          "id": "v3-bt14-34",
          "title": "3. Centralización parcial, aislamiento y neutro",
          "text": "S final debe cumplir mínimo, calentamiento, caída y protección.\nEn LGA con centralización parcial, la caída máxima es 1 %. La DI correspondiente tiene su propio límite; no intercambies ambos valores sin identificar el esquema.\nLa tensión asignada 0,6/1 kV describe el cable y no su corriente admisible. Se estudia junto a sus características y montaje.\nLa sección del neutro se determina por la tabla y las condiciones aplicables. La regla «siempre S/2» no sustituye esa consulta.\nIdea clave: La tensión del aislamiento y la tensión de suministro son datos diferentes.\nComprobación: No. Es la tensión asignada del cable, no la tensión real de servicio.\nConfusión frecuente: 0,5 % en centralización total; 1 % en parcial. El neutro se determina con la tabla, no siempre como S/2.",
          "references": [
            {
              "label": "ITC-BT-14 · §§1, 2 y 3",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-14"
            }
          ]
        }
      ]
    },
    {
      "id": "bt15",
      "title": "Derivaciones individuales",
      "cards": [
        {
          "id": "di",
          "title": "1. Conductores propios y caída de la DI",
          "text": "Mínimo 6 mm² · mando 1,5 mm² rojo\nBT-15 fija mínimo de 6 mm² para polares, neutro y protección. El hilo de mando tiene su prescripción propia: 1,5 mm² y color rojo. El cálculo puede exigir más sección.\nCada suministro tiene sus conductores propios; no se comparten neutro ni PE entre suministros.\nContadores totalmente concentrados: 1 %.\nContadores concentrados en más de un lugar: 0,5 %.\nÚnico usuario sin LGA: 1,5 %.\nConvierte el porcentaje a voltios con ΔU = U·porcentaje/100, usando la tensión de referencia que corresponda. No traslades el 1,5 % a cualquier DI.\nIdea clave: La DI tiene tres límites de caída según el esquema.\nComprobación: Para un único usuario sin LGA, en el supuesto de BT-15.\nConfusión frecuente: LGA y DI intercambian 0,5/1 % según centralización. El 1,5 % no es universal.",
          "references": [
            {
              "label": "ITC-BT-15 · §2–3",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-15"
            }
          ]
        },
        {
          "id": "v3-bt15-35",
          "title": "2. No confundir la DI con la LGA",
          "text": "Tres límites de caída y conductores propios para cada usuario.\nEl mínimo de 6 mm² corresponde a los conductores polares, neutro y protección de la DI. El hilo de mando rojo de 1,5 mm² es otra prescripción.\nLa caída de DI es 1 % con concentración total y 0,5 % con concentración en varios lugares. Son valores inversos a los de LGA en esos esquemas.\nEjemplo: antes de calcular una DI de un bloque, dibuja dónde están sus contadores. Eso evita escoger el porcentaje solo de memoria.\nIdea clave: En centralización total, LGA 0,5 % y DI 1 %.\nComprobación: 1 %; el 0,5 % corresponde a la LGA de ese esquema.\nConfusión frecuente: El 1,5 % es para usuario único sin LGA; no lo uses como caída universal.",
          "references": [
            {
              "label": "ITC-BT-15 · §§1, 2 y 3",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-15"
            }
          ]
        },
        {
          "id": "v3-bt15-36",
          "title": "3. Usuario único y sección final",
          "text": "Tres límites de caída y conductores propios para cada usuario.\nEl 1,5 % se aplica al supuesto de usuario único sin LGA. No significa que cualquier usuario único pueda elegirlo sin revisar su esquema.\nCada suministro mantiene sus conductores propios. La independencia no desaparece porque varios usuarios compartan el edificio.\nLa sección final cumple los mínimos y las comprobaciones térmicas, de caída y protección. Si una condición falla, hay que aumentar sección o revisar el diseño; cumplir solo el mínimo no basta.\nIdea clave: Sin LGA hay un límite específico; los mínimos siguen siendo obligatorios.\nComprobación: No. Debe aumentarse la sección o rediseñarse para cumplir todas las condiciones.\nConfusión frecuente: El 1,5 % es para usuario único sin LGA; no lo uses como caída universal.",
          "references": [
            {
              "label": "ITC-BT-15 · §§1, 2 y 3",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-15"
            }
          ]
        }
      ]
    },
    {
      "id": "bt16",
      "title": "Contadores y centralizaciones",
      "cards": [
        {
          "id": "contadores",
          "title": "1. Armario o local para la centralización",
          "text": "Más de 16 contadores → local\nCon más de 16 contadores se exige local. Con hasta 16, incluidos, pueden alojarse en local o armario, cumpliendo las condiciones correspondientes.\nLa centralización reúne interruptor general de maniobra, embarrado general y fusibles de seguridad, medida, mando cuando proceda, embarrado de protección y bornes.\nEl interruptor general de maniobra del conjunto no es el IGA de una vivienda. Estudia cada unidad por la función que cumple.\nIdea clave: Hasta 16 incluye 16; más de 16 exige local.\nComprobación: No. Hasta 16 pueden alojarse en local o armario cumpliendo sus condiciones.\nConfusión frecuente: 16 exactos no son «más de 16». «Se puede en armario» no significa «debe ser armario».",
          "references": [
            {
              "label": "ITC-BT-16 · §2.2 y §3",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-16"
            }
          ]
        },
        {
          "id": "v3-bt16-37",
          "title": "2. Energía y recinto de contadores",
          "text": "Contar energía no es proteger la instalación.\nEl contador registra energía activa consumida, habitualmente en kWh. La energía depende de la potencia y del tiempo; no es lo mismo que A o kW.\nHasta 16 contadores pueden ir en armario o local; más de 16 requieren local en el supuesto de BT-16.\nEl recinto debe cumplir su uso previsto, seguridad, operación y mantenimiento. Tener espacio para los equipos no demuestra que el recinto sea adecuado.\nIdea clave: Medir correctamente no exime de cumplir las condiciones del recinto.\nComprobación: kWh, que no es potencia instantánea ni intensidad.\nConfusión frecuente: Hasta 16 contadores incluye 16; más de 16 requiere local en el supuesto de BT-16.",
          "references": [
            {
              "label": "ITC-BT-16 · §§1, 2 y 3",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-16"
            }
          ]
        },
        {
          "id": "v3-bt16-38",
          "title": "3. Maniobra, fusibles e identificación",
          "text": "Contar energía no es proteger la instalación.\nEl interruptor general de maniobra permite la maniobra general del conjunto en los términos de BT-16. Los fusibles de seguridad protegen según el esquema; el contador realiza la medida.\nIdentifica inequívocamente cada suministro para operación y mantenimiento. Una etiqueta ambigua puede provocar actuar sobre el usuario equivocado.\nAcceso, lectura y mantenimiento son requisitos del emplazamiento. La exactitud del contador no los sustituye.\nIdea clave: Cada unidad de la centralización tiene una función concreta.\nComprobación: No. Realizan protección; la medida la efectúa el contador.\nConfusión frecuente: Hasta 16 contadores incluye 16; más de 16 requiere local en el supuesto de BT-16.",
          "references": [
            {
              "label": "ITC-BT-16 · §§1, 2 y 3",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-16"
            }
          ]
        }
      ]
    },
    {
      "id": "bt17",
      "title": "Dispositivos generales de mando y protección",
      "cards": [
        {
          "id": "cuadro",
          "title": "1. Protección general y potencia contratada",
          "text": "Proteger no es limitar el contrato\nEl IGA protege generalmente contra sobrecarga y cortocircuito. El control de potencia contratada cumple otra función, aunque se encuentre integrado en el contador.\nUn diferencial puro detecta corrientes residuales y no sustituye la protección de sobreintensidad. El cuadro se completa con protecciones de circuitos y sobretensiones cuando correspondan.\nEn vivienda, los dispositivos generales se sitúan cerca de la entrada a altura entre 1,4 y 2 m. En locales comerciales, la altura mínima es 1 m, según BT-17 y sus condiciones.\nIdea clave: El control de potencia contratada no sustituye al IGA.\nComprobación: No. El IGA realiza la protección general contra sobrecarga y cortocircuito.\nConfusión frecuente: Un contador con limitación de potencia no elimina el IGA.",
          "references": [
            {
              "label": "ITC-BT-17 · §1.1–1.3",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-17"
            }
          ]
        },
        {
          "id": "v3-bt17-39",
          "title": "2. Asignar una función a cada aparato",
          "text": "IGA: protección general; diferencial: corrientes residuales; ICP: control de potencia.\nIGA: interruptor general automático, protección general.\nICP: interruptor de control de potencia, función de control de potencia.\nDiferencial: detecta corriente diferencial residual.\nPIA: protección automática de cada circuito, coordinada con sus conductores.\nNo confundas In, corriente asignada que puede conducir, con IΔn, sensibilidad diferencial. Por ejemplo, 40 A y 30 mA describen características diferentes.\nIdea clave: IGA protege en general; PIA protege circuitos; diferencial detecta corriente residual.\nComprobación: No. Esa función debe realizarla la protección adecuada o un dispositivo combinado que la incluya.\nConfusión frecuente: Un ICP no sustituye al IGA, y 40 A de un diferencial no son 40 mA de sensibilidad.",
          "references": [
            {
              "label": "ITC-BT-17 · §§1.1, 1.2 y 1.3; ITC-BT-24 · §§3.5 y 4.1",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-17"
            }
          ]
        },
        {
          "id": "v3-bt17-40",
          "title": "3. Emplazamiento y corte omnipolar",
          "text": "IGA: protección general; diferencial: corrientes residuales; ICP: control de potencia.\nLa posición de los dispositivos generales depende del uso. En vivienda se sitúan cerca de la entrada y a 1,4–2 m de altura; no traslades ese intervalo a todos los locales.\nEl dispositivo previsto debe realizar corte omnipolar. Esto no convierte al PE en un conductor que se deba interrumpir.\nChoque eléctrico, sobreintensidad y sobretensión son fenómenos diferentes. El diseño combina las funciones necesarias; ningún nombre comercial demuestra que un aparato las incorpore todas.\nIdea clave: Cortar los conductores activos no significa interrumpir el PE.\nComprobación: No. Se refiere a los conductores activos que corresponden; el PE mantiene su continuidad.\nConfusión frecuente: Un ICP no sustituye al IGA, y 40 A de un diferencial no son 40 mA de sensibilidad.",
          "references": [
            {
              "label": "ITC-BT-17 · §§1.1, 1.2 y 1.3; ITC-BT-24 · §§3.5 y 4.1",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-17"
            }
          ]
        }
      ]
    },
    {
      "id": "bt18",
      "title": "Puesta a tierra",
      "cards": [
        {
          "id": "pe",
          "title": "1. Sección del PE y conservación de la tierra",
          "text": "S≤16: PE=S · 1635: PE=S/2\nPara fase y PE del mismo material, la tabla establece: S≤16 → PE=S; 1635 → PE=S/2. S y PE se expresan en mm².\nSi el PE de cobre no forma parte de la canalización de alimentación: mínimo general de 2,5 mm² con protección mecánica o 4 mm² sin ella. Una regla específica puede exigir más.\nEl PE conserva su continuidad: no lleva fusibles ni corte ordinario. La equipotencialidad reduce diferencias de potencial entre partes que deban conectarse.\nBT-18 §12 exige comprobación de tierra al menos anual, en la época de terreno más seco. Medir continuidad de PE y resistencia de tierra son ensayos distintos.\nIdea clave: La sección del PE depende de la fase y de las condiciones de montaje.\nComprobación: PE de 16 mm², sujeto a los demás requisitos aplicables.\nConfusión frecuente: No uses tuberías como sustituto del PE. Continuidad de PE y resistencia de la toma de tierra son ensayos distintos.",
          "references": [
            {
              "label": "ITC-BT-18 · §3.4, tabla 2 y §12",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-18"
            },
            {
              "label": "ITC-BT-19 · §2.3",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-19"
            }
          ]
        },
        {
          "id": "v3-bt18-41",
          "title": "2. Elementos del camino de protección",
          "text": "Electrodo, conductor de tierra, borne y PE tienen funciones relacionadas pero distintas.\nEl electrodo está en contacto con el terreno; el conductor de tierra lo une al borne principal; los PE conectan las masas al sistema de protección. Son elementos relacionados, no nombres intercambiables.\nLa tierra ayuda a limitar tensiones peligrosas y a cumplir las condiciones de protección. No basta tener un electrodo si fallan continuidad o coordinación.\nTabla de PE del mismo material: hasta 16 mm² de fase, PE igual a fase; por encima de 16 y hasta 35 mm², PE de 16 mm². No interrumpas el PE mediante fusible o corte ordinario.\nIdea clave: La puesta a tierra debe coordinarse con las protecciones.\nComprobación: S_PE = 10 mm², sin olvidar las demás condiciones aplicables.\nConfusión frecuente: No uses la tubería como sustituto del conductor de protección. Medir continuidad no es medir resistencia de tierra.",
          "references": [
            {
              "label": "ITC-BT-18 · §§3, 4, 6, 7, 8 y 12",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-18"
            }
          ]
        },
        {
          "id": "v3-bt18-42",
          "title": "3. PE separado y comprobaciones",
          "text": "Electrodo, conductor de tierra, borne y PE tienen funciones relacionadas pero distintas.\nPara fase >35 mm² y PE del mismo material, la tabla da PE = S_fase/2. Esa relación no se aplica a todos los tramos.\nUn PE de cobre separado de la canalización de alimentación tiene mínimo general de 2,5 mm² si está protegido mecánicamente o 4 mm² si no lo está.\nLa revisión de tierra es al menos anual en la época más seca. Continuidad comprueba el camino conductor; resistencia de tierra comprueba la toma respecto del terreno. Instrumentos, procedimiento y resultado son diferentes.\nIdea clave: La medida de continuidad no sustituye la medida de tierra.\nComprobación: 4 mm², salvo exigencia específica mayor.\nConfusión frecuente: No uses la tubería como sustituto del conductor de protección. Medir continuidad no es medir resistencia de tierra.",
          "references": [
            {
              "label": "ITC-BT-18 · §§3, 4, 6, 7, 8 y 12",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-18"
            }
          ]
        }
      ]
    },
    {
      "id": "bt19",
      "title": "Instalaciones interiores: reglas generales",
      "cards": [
        {
          "id": "dimensionar",
          "title": "1. Una secuencia para elegir sección",
          "text": "Capacidad térmica + caída + corto + mínimos\nCalcula corriente de empleo con los datos de la carga.\nIdentifica material, aislamiento, montaje y conductores cargados.\nConsulta la tabla y aplica correcciones térmicas.\nComprueba caída, protección, cortocircuito y mínimos.\nElige una sección normalizada que cumpla todo.\nSin método de instalación y tabla aplicable no se justifica una intensidad admisible exacta.\nPara ejercicio resistivo: R = ρL/S; monofásica sin reactancia, S ≈ 2PL/(γUΔU). Aquí L es distancia de ida y ΔU se expresa en voltios. Es una aproximación de cálculo, no toda la justificación de un proyecto.\nIdea clave: Sección final: el valor normalizado que cumple todas las condiciones.\nComprobación: No. Hay que elegir una sección normalizada suficiente y comprobar todas las condiciones.\nConfusión frecuente: No redondees la sección calculada hacia abajo por proximidad.",
          "references": [
            {
              "label": "ITC-BT-19 · §2.2",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-19"
            },
            {
              "label": "ITC-BT-22 · §1",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-22"
            }
          ]
        },
        {
          "id": "iz",
          "title": "2. Corregir la intensidad de una tabla",
          "text": "I_z=I_tab·k₁·k₂·…\nLa capacidad corregida se obtiene como I_z = I_tab·k₁·k₂·…. Temperatura, agrupación, disposición, número de conductores cargados y aislamiento térmico pueden cambiarla.\nSi buscas la tabla a partir de una capacidad necesaria, despeja: I_tab ≥ I_z necesaria/(producto de factores). Un factor menor que uno exige una capacidad de tabla mayor.\nEjemplo: para 20 A y k=0,8 necesitas al menos 25 A de tabla. BT-19 remite a normas y BT-02 permite identificar sus referencias: una tabla abreviada no cubre todos los montajes.\nIdea clave: Los factores reducen o modifican la capacidad en las condiciones reales.\nComprobación: 25 A: 20/0,8. No 16 A.\nConfusión frecuente: No multipliques la corriente necesaria por 0,8 para buscar una tabla menor: divide por 0,8.",
          "references": [
            {
              "label": "ITC-BT-19 · §2.2.3",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-19"
            },
            {
              "label": "ITC-BT-02",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-2"
            }
          ]
        },
        {
          "id": "caida",
          "title": "3. Asignar y calcular la caída",
          "text": "Vivienda 3 % · otros 3 % luz / 5 % otros usos\nEn vivienda, el límite interior es 3 %, también para cocina y horno. Para otros usos, el general es 3 % en alumbrado y 5 % en los demás usos. Los supuestos particulares de la tabla se consultan aparte.\nModelo resistivo de dos hilos iguales: CC: ΔU=2IL/(γS); monofásica CA sin reactancia: ΔU≈2IL cosφ/(γS); trifásica equilibrada: ΔU≈√3 IL cosφ/(γS). L es distancia de ida: no la dupliques otra vez.\nConvierte % a V con la tensión de referencia correcta. La compensación entre DI e instalación interior existe bajo condiciones; no la extrapoles a LGA.\nTramo | Límite de referencia | \nInterior vivienda | 3 % | \nInterior otros usos, luz / resto | 3 % / 5 % | \nTransformador propio, luz / resto desde su salida | 4,5 % / 6,5 % | \nGenerador → interconexión | 1,5 % a I nominal | \nCircuito VE → conexión | 5 % |\nIdea clave: Primero fija el límite de tu tramo; después conviértelo a voltios.\nComprobación: 6,9 V: 230 ×0,03.\nConfusión frecuente: En vivienda, cocina/horno no pasa al 5 % por llamarlo «fuerza».",
          "references": [
            {
              "label": "ITC-BT-19 · §2.2.2",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-19"
            },
            {
              "label": "ITC-BT-25 · §3",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-25"
            },
            {
              "label": "ITC-BT-40 · §5",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-40"
            },
            {
              "label": "ITC-BT-52 · §5",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-52"
            }
          ]
        },
        {
          "id": "identificar",
          "title": "4. Colores, conexiones y comportamiento ante el fuego",
          "text": "PE verde-amarillo · N azul claro\nPE: verde-amarillo.\nNeutro: azul claro.\nFases: identificables con marrón, negro y gris según el caso.\nLa identificación facilita reconocer conductores, pero no sustituye comprobar su estado eléctrico con un procedimiento seguro. Un azul no se presume sin tensión.\nLas conexiones se realizan con medios apropiados; retorcer y cubrir con cinta no sustituye un dispositivo adecuado. No propagación de llama, no propagación del incendio y baja emisión de humos describen características distintas.\nIdea clave: El color identifica una función; no prueba ausencia de tensión.\nComprobación: No. Está reservado para la función de protección.\nConfusión frecuente: Un conductor azul no se presume libre de tensión; no uses verde-amarillo como fase.",
          "references": [
            {
              "label": "ITC-BT-19 · §2.2.4 y §2.11",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-19"
            },
            {
              "label": "ITC-BT-20",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-20"
            }
          ]
        },
        {
          "id": "aislamiento",
          "title": "5. Leer la tabla de ensayo de aislamiento",
          "text": "Tabla literal BT-19: 250 / 500 / 1.000 V CC\nEl ensayo aplica una tensión continua de prueba y mide una resistencia de aislamiento. No confundas los V del instrumento con los MΩ del resultado.\nLa tabla siguiente reproduce los valores literales de BT-19. Normas de verificación posteriores pueden contener otros valores: identifica exactamente qué documento pregunta el examen.\nSe ensaya con la instalación sin tensión y con equipos sensibles protegidos conforme al procedimiento. El botón TEST de un diferencial no realiza este ensayo.\nTensión nominal, tabla 3 BT-19 | Ensayo CC | Mínimo | \nMBTS/MBTP | 250 V | 0,25 MΩ | \n≤500 V salvo anterior | 500 V | 0,5 MΩ | \n>500 V | 1.000 V | 1 MΩ |\nIdea clave: Tensión de ensayo y resistencia mínima son columnas distintas.\nComprobación: 500 V CC y 0,5 MΩ. Hay que distinguir esa tabla de otras normas de verificación.\nConfusión frecuente: La tensión de ensayo no es resistencia mínima. El botón TEST de un diferencial no es un ensayo de aislamiento.",
          "references": [
            {
              "label": "ITC-BT-19 · §2.9, tabla 3",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-19"
            }
          ]
        }
      ]
    },
    {
      "id": "bt20",
      "title": "Sistemas de instalación",
      "cards": [
        {
          "id": "v3-bt20-43",
          "title": "1. Cable y montaje deben ser compatibles",
          "text": "Cable, soporte y ambiente forman un conjunto; la tabla de intensidades no decide por sí sola el montaje.\nLa elección depende del tipo de conductor y del emplazamiento. BT-20 distingue conductores desnudos, aislados y cables con cubierta, con sistemas admitidos diferentes.\nBajo tubo, el apartado general exige tensión asignada no inferior a 450/750 V, además de BT-21 y las condiciones particulares.\nPara fijación directa se emplea cable con aislamiento y cubierta, mínimo 0,6/1 kV. Las sujeciones no deben superar 0,40 m entre sí ni dañar la cubierta o permitir deformación por peso.\nIdea clave: Un conductor bajo tubo no se admite automáticamente fijado directamente.\nComprobación: No. Se exige cable con aislamiento y cubierta y las características del apartado.\nConfusión frecuente: Conductor aislado sin cubierta y cable con cubierta no son intercambiables en cualquier montaje.",
          "references": [
            {
              "label": "ITC-BT-20 · §§2.1, 2.2 y tablas 1–2",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-20"
            }
          ]
        },
        {
          "id": "v3-bt20-44",
          "title": "2. Protección mecánica, enterramiento y huecos",
          "text": "Cable, soporte y ambiente forman un conjunto; la tabla de intensidades no decide por sí sola el montaje.\nSi existe riesgo de daño, añade la protección mecánica adecuada. Conexiones y derivaciones se alojan en cajas o dispositivos equivalentes que permitan protección y verificación.\nEn enterramiento, el conductor va bajo tubo en las condiciones aplicables; el apartado exceptúa el cable con cubierta y tensión asignada 0,6/1 kV. Consulta también BT-07, BT-21 y la ITC particular.\nPara el sistema de huecos de construcción, el hueco no se destina simultáneamente a otro fin. Un espacio vacío no es por sí solo una canalización admisible.\nIdea clave: El aislamiento eléctrico no sustituye la protección frente a golpes.\nComprobación: No. Debe tener la protección mecánica que corresponda al emplazamiento.\nConfusión frecuente: Conductor aislado sin cubierta y cable con cubierta no son intercambiables en cualquier montaje.",
          "references": [
            {
              "label": "ITC-BT-20 · §§2.1, 2.2 y tablas 1–2",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-20"
            }
          ]
        },
        {
          "id": "v3-bt20-45",
          "title": "3. Acceso y reconocimiento de la instalación",
          "text": "Cable, soporte y ambiente forman un conjunto; la tabla de intensidades no decide por sí sola el montaje.\nLas conexiones necesitan cajas adecuadas y accesibles en las condiciones del sistema. El trazado debe permitir reconocer y conservar la instalación sin destruir parcialmente la construcción para ello.\nCuando el tipo, dimensiones o trazado no bastan para distinguir circuitos, se completa la identificación con planos, etiquetas o avisos legibles e indelebles.\nPiensa en quien la revise después: poder identificar un circuito y acceder a sus puntos de conexión forma parte de un montaje correcto.\nIdea clave: La instalación debe poder verificarse y mantenerse.\nComprobación: No. Debe cumplir las condiciones de conexión y accesibilidad para verificación y mantenimiento.\nConfusión frecuente: Conductor aislado sin cubierta y cable con cubierta no son intercambiables en cualquier montaje.",
          "references": [
            {
              "label": "ITC-BT-20 · §§2.1, 2.2 y tablas 1–2",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-20"
            }
          ]
        }
      ]
    },
    {
      "id": "bt21",
      "title": "Tubos y canales protectoras",
      "cards": [
        {
          "id": "tubos",
          "title": "1. Escoger tubo y dejar acceso al cableado",
          "text": "Tabla según sistema y número/sección de conductores\nBT-21 diferencia montaje superficial, empotrado, al aire y enterrado. Elige su tabla de diámetro según número y sección de conductores, y sus exigencias mecánicas y ambientales.\nEn la regla general de tendido bajo tubo: registros a no más de 15 m en tramos rectos y no más de tres curvas en ángulo entre registros consecutivos, con las condiciones de §2.1.\nLa sección del cable se expresa en mm²; el diámetro del tubo, en mm. Son dimensiones diferentes y ninguna determina por sí sola la otra.\nIdea clave: Diámetro, curvas y registros deben permitir instalar y retirar conductores.\nComprobación: 15 m en el supuesto de BT-21 §2.1; no es la longitud máxima del circuito.\nConfusión frecuente: Diámetro del tubo no es sección del cable. No traslades una tabla de superficie a enterrado sin revisar.",
          "references": [
            {
              "label": "ITC-BT-21 · §1 y §2.1",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-21"
            }
          ]
        },
        {
          "id": "v3-bt21-46",
          "title": "2. Sustituibilidad, registros y curvas",
          "text": "Selecciona el tubo por su montaje y deja los conductores sustituibles.\nEl tubo se elige por montaje e influencias externas. El conjunto debe permitir introducir y retirar los conductores; que el cable entre a la fuerza no justifica el dimensionado.\nMemoriza con su significado: 15 m, separación máxima de registros en tramos rectos; tres, máximo de curvas en ángulo entre registros consecutivos.\nNingún límite es una longitud máxima total del circuito. Se dejan los registros necesarios a lo largo del recorrido.\nIdea clave: Dos límites distintos: distancia en recta y número de curvas.\nComprobación: No. También se comprueba el máximo de tres curvas en ángulo y las demás condiciones.\nConfusión frecuente: 15 m es la separación máxima de registros en tramos rectos; tres curvas es otro límite distinto.",
          "references": [
            {
              "label": "ITC-BT-21 · §§1, 2.1, 2.2 y 3",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-21"
            }
          ]
        },
        {
          "id": "v3-bt21-47",
          "title": "3. Uniones, cajas y canales cerradas",
          "text": "Selecciona el tubo por su montaje y deja los conductores sustituibles.\nLas uniones de tubo deben conservar la protección sin dañar conductores. Las conexiones de cables se efectúan en cajas adecuadas y accesibles con dispositivos apropiados.\nEl diámetro depende de número, sección y características de conductores y del montaje. Copiar el diámetro de otra obra no garantiza tendido ni capacidad.\nLa admisión de conductores en canales depende del grado de protección y apertura de la tapa: consulta las condiciones de IP4X o IPXXD y apertura mediante útil o acción manual importante del apartado. Una canal cualquiera no se presume equivalente.\nIdea clave: El sistema debe mantener protección y acceso en todo el recorrido.\nComprobación: No. Las conexiones se realizan con dispositivos apropiados en cajas adecuadas y accesibles.\nConfusión frecuente: 15 m es la separación máxima de registros en tramos rectos; tres curvas es otro límite distinto.",
          "references": [
            {
              "label": "ITC-BT-21 · §§1, 2.1, 2.2 y 3",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-21"
            }
          ]
        },
        {
          "id": "v3-bt21-48",
          "title": "4. Continuidad de las partes metálicas",
          "text": "Selecciona el tubo por su montaje y deja los conductores sustituibles.\nCuando el sistema tiene partes metálicas, verifica la continuidad eléctrica de protección y las conexiones que correspondan. La función protectora no se demuestra por la simple apariencia del montaje.\nComprueba también que juntas, fijaciones y entradas no deterioren cables ni reduzcan las características requeridas del tubo o canal. La continuidad y la protección mecánica son comprobaciones relacionadas, pero diferentes.\nIdea clave: La proximidad entre piezas no prueba continuidad eléctrica.\nComprobación: No. Hay que asegurar las uniones y conexiones pertinentes conforme al sistema.\nConfusión frecuente: 15 m es la separación máxima de registros en tramos rectos; tres curvas es otro límite distinto.",
          "references": [
            {
              "label": "ITC-BT-21 · §§1, 2.1, 2.2 y 3",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-21"
            }
          ]
        }
      ]
    },
    {
      "id": "bt22",
      "title": "Protección contra sobreintensidades",
      "cards": [
        {
          "id": "sobreintensidad",
          "title": "1. Coordinar carga, cable y protección",
          "text": "I_B ≤ I_n ≤ I_z · I₂ ≤1,45 I_z\nI_B: corriente de empleo de la carga.\nI_n: corriente asignada o calibre de la protección.\nI_z: capacidad del cable con sus correcciones.\nI₂: corriente convencional de actuación del dispositivo.\nCondiciones de coordinación frente a sobrecarga: I_B ≤ I_n ≤ I_z e I₂ ≤1,45 I_z. Cumplir la caída de tensión no garantiza cumplirlas.\nEn cortocircuito, comprueba capacidad de corte frente a Icc máxima y actuación frente a Icc mínima, con los tiempos y protección térmica pertinentes. En el modelo de bucle dado: Icc = U₀/|Z_bucle|. Un factor aproximado como 0,8 solo se incorpora si el método del ejercicio lo establece.\nIdea clave: El dispositivo debe proteger el cable y poder interrumpir el defecto previsto.\nComprobación: No. Debe cumplirse la coordinación; I_n no debe superar I_z en esta condición.\nConfusión frecuente: Calibre en amperios y poder de corte en kA no son intercambiables.",
          "references": [
            {
              "label": "ITC-BT-22 · §1",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-22"
            },
            {
              "label": "ITC-BT-19 · §2.2.3",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-19"
            }
          ]
        },
        {
          "id": "v3-bt22-49",
          "title": "2. Calibre y poder de corte",
          "text": "La protección debe coordinarse con el cable y poder cortar la corriente de defecto prevista.\nSobrecarga: corriente excesiva en un circuito eléctricamente sano. Cortocircuito: defecto cuya corriente depende de la impedancia de fuente y lazo y puede ser muy elevada.\nEl calibre es la corriente asignada, en A. El poder de corte es la corriente de cortocircuito que el dispositivo puede interrumpir en sus condiciones, habitualmente expresada en kA.\nCompara poder de corte con la corriente prevista en su punto. Una coordinación de respaldo debe estar documentada; no se presupone porque haya otra protección antes. El diferencial puro no reemplaza al dispositivo de sobreintensidad.\nIdea clave: Amperios de servicio y kiloamperios de interrupción describen cosas distintas.\nComprobación: No. 16 A es corriente asignada; 6 kA, capacidad de interrupción declarada en sus condiciones.\nConfusión frecuente: El calibre del interruptor no es su poder de corte. Un diferencial ordinario no protege contra sobrecargas.",
          "references": [
            {
              "label": "ITC-BT-22 · §§1.1, 1.2 y 1.3; ITC-BT-19 · §2.2",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-22"
            }
          ]
        },
        {
          "id": "v3-bt22-50",
          "title": "3. Proteger cada tramo y comprobar ambos extremos",
          "text": "La protección debe coordinarse con el cable y poder cortar la corriente de defecto prevista.\nAumentar el calibre para evitar disparos puede dejar el conductor sin protección adecuada. Revisa carga, cable y causa del disparo antes de concluir que el aparato es pequeño.\nCuando un ramal reduce capacidad admisible, estudia la protección exigible en su origen y las excepciones reglamentarias aplicables; no las presumas.\nComprueba los dos casos: la Icc máxima no supera la capacidad de interrupción o coordinación válida; la Icc mínima provoca la actuación dentro de las condiciones necesarias para proteger el cable.\nIdea clave: La Icc máxima interesa al corte; la mínima, a la actuación requerida.\nComprobación: No. La Icc mínima y el tiempo de actuación también deben garantizar la protección.\nConfusión frecuente: El calibre del interruptor no es su poder de corte. Un diferencial ordinario no protege contra sobrecargas.",
          "references": [
            {
              "label": "ITC-BT-22 · §§1.1, 1.2 y 1.3; ITC-BT-19 · §2.2",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-22"
            }
          ]
        }
      ]
    },
    {
      "id": "bt23",
      "title": "Protección contra sobretensiones",
      "cards": [
        {
          "id": "diferencial",
          "title": "1. Elegir el dispositivo por su función",
          "text": "Elige el dispositivo por la función\nDiferencial puro: corrientes residuales; distingue In e IΔn.\nMagnetotérmico: sobrecarga y cortocircuito.\nProtector de sobretensiones: la función concreta declarada para el tipo de sobretensión.\nCombinado: puede integrar varias funciones; hay que comprobar cuáles.\nBT-23 trata sobretensiones transitorias. No se confunden con tensiones elevadas temporales o sostenidas. Las categorías I a IV indican soportabilidad al impulso; IV corresponde al origen.\nLa selectividad busca limitar la desconexión a la parte afectada. Tipo A de un diferencial y curva C de un magnetotérmico son clasificaciones distintas.\nIdea clave: Fuga, sobreintensidad y sobretensión necesitan funciones de protección diferentes.\nComprobación: No. Detecta corriente diferencial residual; no realiza por sí solo la función contra sobretensiones.\nConfusión frecuente: Tipo A de diferencial no es curva C de magnetotérmico. Ningún dispositivo protege por sí solo de todo.",
          "references": [
            {
              "label": "ITC-BT-24 · §3.5 y §4.1",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-24"
            },
            {
              "label": "ITC-BT-23 · §1–3",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-23"
            },
            {
              "label": "ITC-BT-19 · §2.4",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-19"
            }
          ]
        },
        {
          "id": "v3-bt23-51",
          "title": "2. Transitorias y categorías de impulso",
          "text": "La BT-23 trata principalmente sobretensiones transitorias transmitidas por las redes.\nUna sobretensión transitoria es un aumento breve asociado, por ejemplo, a fenómenos atmosféricos o maniobras. Una elevación sostenida es otro fenómeno y requiere la función de protección correspondiente.\nUn diferencial detecta desequilibrio de corrientes, no sobretensión por sí solo. Si un equipo combina funciones, comprueba su declaración y características.\nLas categorías I–IV relacionan emplazamiento y tensión soportada a impulsos. No se confunden con clases de aislamiento I, II y III ni con la categoría del instalador.\nIdea clave: La categoría de sobretensión no es una clase de aislamiento.\nComprobación: Soportabilidad a impulsos según el emplazamiento y la función del equipo.\nConfusión frecuente: No confundas sobretensión transitoria, sobretensión temporal y fuga diferencial.",
          "references": [
            {
              "label": "ITC-BT-23 · §§1, 2, 3 y 4; ITC-BT-24",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-23"
            }
          ]
        },
        {
          "id": "v3-bt23-52",
          "title": "3. Coordinar la protección con el equipo",
          "text": "La BT-23 trata principalmente sobretensiones transitorias transmitidas por las redes.\nLa categoría IV se asocia al origen de la instalación, con mayor exigencia de soportabilidad al impulso. Las otras categorías se interpretan según emplazamiento y uso.\nCompara el nivel de protección del dispositivo con la tensión soportada por el equipo y comprueba la coordinación necesaria. Un equipo no queda protegido solo por tener un protector en algún punto.\nRespeta conexión a tierra e instrucciones de montaje. Evalúa las situaciones de BT-23 junto con las prescripciones particulares que puedan exigir protección; no afirmes que cualquier instalación puede omitirla.\nIdea clave: El dispositivo y su instalación deben limitar el impulso a un nivel adecuado.\nComprobación: No. El montaje, las conexiones y la coordinación forman parte de su eficacia.\nConfusión frecuente: No confundas sobretensión transitoria, sobretensión temporal y fuga diferencial.",
          "references": [
            {
              "label": "ITC-BT-23 · §§1, 2, 3 y 4; ITC-BT-24",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-23"
            }
          ]
        }
      ]
    },
    {
      "id": "bt24",
      "title": "Protección contra contactos eléctricos",
      "cards": [
        {
          "id": "contactos",
          "title": "1. Directo, indirecto y protección adicional",
          "text": "Parte activa / masa accidentalmente en tensión\nContacto directo: tocar una parte activa. Se evita mediante aislamiento, barreras o envolventes y otras medidas admitidas.\nContacto indirecto: tocar una masa que queda en tensión por un defecto. Se aplican medidas como corte automático con tierra y protección coordinadas, o protección por clase II en sus condiciones.\nUn diferencial de ≤30 mA se reconoce como protección adicional frente a contacto directo. No convierte un conductor accesible en seguro ni sustituye la medida principal.\nIdea clave: El diferencial de 30 mA complementa la protección; no permite exponer partes activas.\nComprobación: No. La protección adicional no sustituye el aislamiento, las barreras y las medidas principales.\nConfusión frecuente: Un diferencial no convierte en seguro un conductor desnudo accesible.",
          "references": [
            {
              "label": "ITC-BT-24 · §3 y §4",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-24"
            }
          ]
        },
        {
          "id": "tt",
          "title": "2. La desigualdad de protección en TT",
          "text": "R_A·IΔn ≤ U_L\nPara TT protegido por diferencial, comprueba R_A·IΔn ≤ U_L. R_A incluye resistencia de toma de tierra y conductores de protección de masas; IΔn es la corriente diferencial residual asignada.\nUsa IΔn en amperios: 30 mA =0,030 A. U_L es el límite convencional que corresponde al entorno, 50 V, 24 V u otro según el supuesto.\nEjemplo: 100 Ω ×0,030 A =3 V. Este producto se compara con el límite aplicable. El despeje R_A ≤U_L/IΔn es una condición de ejercicio, no un objetivo universal para diseñar tierra ni sustituto de otras prescripciones.\nIdea clave: Con diferencial, usa su sensibilidad en amperios, no su corriente nominal de carga.\nComprobación: 3 V: 100 ×0,030. Se compara con la tensión límite aplicable y se completan las demás verificaciones.\nConfusión frecuente: 30 mA son 0,030 A. Los 40 A nominales del diferencial no son IΔn.",
          "references": [
            {
              "label": "ITC-BT-24 · §4.1.2",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-24"
            }
          ]
        },
        {
          "id": "v3-bt24-53",
          "title": "3. Elegir la medida después del tipo de contacto",
          "text": "Primero identifica el contacto; después la medida de protección y sus condiciones.\nLa clasificación depende de la parte tocada: activa en servicio normal, contacto directo; masa en tensión por defecto, indirecto. No depende de la gravedad del daño.\nEn contacto directo se mantiene la protección principal. El diferencial adicional no justifica partes activas expuestas.\nEn TT se coordinan tierra, corriente de actuación y tensión límite. Con diferencial se usa su sensibilidad residual asignada. El botón TEST no mide la toma de tierra.\nIdea clave: La medida y sus condiciones deben corresponder al esquema real.\nComprobación: La corriente diferencial residual asignada, en A; por ejemplo 0,030 A para 30 mA.\nConfusión frecuente: 30 mA es sensibilidad, no corriente de carga. El botón TEST no mide la resistencia de la toma de tierra.",
          "references": [
            {
              "label": "ITC-BT-24 · §§3 y 4; ITC-BT-18",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-24"
            }
          ]
        },
        {
          "id": "v3-bt24-54",
          "title": "4. TEST y clase II: qué comprueban",
          "text": "Primero identifica el contacto; después la medida de protección y sus condiciones.\nEl botón TEST acciona el circuito de prueba del diferencial. No mide resistencia de tierra ni demuestra continuidad de PE o todos los parámetros de actuación.\nLa verificación instrumental y los ensayos de tierra y continuidad se realizan con sus procedimientos propios.\nLa clase II se basa en doble aislamiento o aislamiento reforzado adecuado. No significa categoría II de sobretensión ni una clase de eficiencia energética.\nIdea clave: TEST, medición de tierra y ensayo instrumental son comprobaciones diferentes.\nComprobación: No. Comprueba el circuito de prueba del diferencial; no sustituye las demás verificaciones.\nConfusión frecuente: 30 mA es sensibilidad, no corriente de carga. El botón TEST no mide la resistencia de la toma de tierra.",
          "references": [
            {
              "label": "ITC-BT-24 · §§3 y 4; ITC-BT-18",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-24"
            }
          ]
        }
      ]
    },
    {
      "id": "bt25",
      "title": "Viviendas: circuitos y puntos de utilización",
      "cards": [
        {
          "id": "circuitos",
          "title": "1. C1 a C5: uso, protección y sección",
          "text": "Luz · tomas · cocina · lavado · baño\nLa tabla resume los cinco circuitos de electrificación básica. Relaciona uso, automático, sección mínima y número máximo de puntos. Los mínimos de sección no eliminan el cálculo: puede ser necesario aumentar.\nNo confundas C3 —cocina y horno— con C5 —baño y tomas auxiliares de cocina—. El frigorífico pertenece a C2.\nC4 común tiene características y notas específicas para bases y derivaciones. Una base marcada 16 A no describe por sí sola toda la configuración de ese circuito.\nCircuito | Uso | PIA | Cu mín. | Máximo puntos | \nC1 | Iluminación | 10 A | 1,5 mm² | 30 | \nC2 | Tomas generales y frigorífico | 16 A | 2,5 mm² | 20 | \nC3 | Cocina y horno | 25 A | 6 mm² | 2 | \nC4 | Lavadora, lavavajillas y termo | 20 A | 4 mm² | 3 | \nC5 | Baño y auxiliares cocina | 16 A | 2,5 mm² | 6 |\nIdea clave: C2 incluye frigorífico; C5 incluye baño y tomas auxiliares de cocina.\nComprobación: C5, no C3 de cocina y horno.\nConfusión frecuente: Frigorífico es C2; encimera/baño C5. No confundas una base de 16 A con la configuración completa de C4.",
          "references": [
            {
              "label": "ITC-BT-25 · §2.3.1 y tabla 1",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-25"
            }
          ]
        },
        {
          "id": "c4",
          "title": "2. C4 común o tres circuitos independientes",
          "text": "Nota 8: tres circuitos independientes de 16 A\nEl C4 común alimenta lavadora, lavavajillas y termo, con referencia de 20 A y 4 mm². Sus notas incluyen condiciones de bases y derivaciones: lee el conjunto.\nLa nota 8 permite alimentación independiente de cada aparato mediante tres circuitos de 16 A, con sección adecuada; la referencia habitual del supuesto es 2,5 mm².\nEse desdoblamiento no supone por sí mismo pasar a electrificación elevada ni necesitar diferencial adicional. No lo confundas con añadir circuitos por otros usos previstos.\nIdea clave: Desdoblar C4 no obliga por sí solo a elevada ni a otro diferencial.\nComprobación: No, según la nota 8 de la tabla de BT-25.\nConfusión frecuente: No cuentes el simple desdoblamiento como razón automática de elevada o de otro diferencial.",
          "references": [
            {
              "label": "ITC-BT-25 · tabla 1, notas 6 y 8",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-25"
            }
          ]
        },
        {
          "id": "extras",
          "title": "3. Cuándo aparecen C6 a C13",
          "text": "C8 calefacción · C9 aire · C10 secadora · C11 automatización\nC6 y C7: ampliaciones de iluminación y tomas según los supuestos.\nC8: calefacción eléctrica; C9: aire acondicionado.\nC10: secadora; C11: automatización, energía y seguridad.\nC12: circuitos adicionales C3/C4 o C5 cuando proceda.\nC13: recarga del supuesto de vivienda, junto con BT-52.\nLa elevada responde a necesidades previstas. El garaje colectivo y su recarga se resuelven con BT-52: no copies el circuito de una vivienda a todos los esquemas.\nIdea clave: Electrificación elevada no significa instalar todos los circuitos sin un uso previsto.\nComprobación: No. Su circuito previsto es C10 cuando corresponda.\nConfusión frecuente: Secadora no es C4. No igualar esquema 4 VE y circuito C4 de vivienda.",
          "references": [
            {
              "label": "ITC-BT-25 · §2.3.2",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-25"
            },
            {
              "label": "ITC-BT-52 · §3",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-52"
            }
          ]
        },
        {
          "id": "dif-vivienda",
          "title": "4. Diferenciales y corriente para la caída",
          "text": "Uno por cada 5 circuitos, con excepciones\nEn vivienda se emplean diferenciales de sensibilidad máxima general 30 mA y como mínimo uno por cada cinco circuitos. Aplica la excepción del C4 desdoblado.\nC13 dispone de diferencial exclusivo con las características de BT-52. No lo incluyas sin revisar sus requisitos particulares.\nBT-25 §3 calcula la caída hasta el punto más alejado para la intensidad nominal del automático de cada circuito, según sus condiciones. No la reduzcas con una potencia media supuesta que el método no autoriza.\nIdea clave: En vivienda, la caída de cada circuito se calcula según el automático y las condiciones de BT-25.\nComprobación: No. Se atiende a la intensidad nominal del automático del circuito y a las condiciones del apartado.\nConfusión frecuente: No reduzcas esa corriente de cálculo de caída con una potencia media inventada del circuito.",
          "references": [
            {
              "label": "ITC-BT-25 · §2.1, §2.3.2 y §3",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-25"
            }
          ]
        },
        {
          "id": "puntos",
          "title": "5. Puntos mínimos en cada estancia",
          "text": "Tabla 2: no basta con tener C1 y C2\nLa tabla 2 fija mínimos por estancia. En salón y dormitorios, las tomas generales se prevén como una por cada 6 m², redondeando hacia arriba, con mínimo de tres.\nEjemplo: en 20 m², 20/6 =3,33; se requieren cuatro por ese criterio. Para iluminación, un punto hasta 10 m² y dos por encima, en las filas correspondientes.\nPasillos: punto de luz cada 5 m y mando en cada acceso; las bases se comprueban según longitud. Cocina, baño y otras estancias tienen sus propias filas. Consulta la tabla completa y no solo el número de circuitos.\nIdea clave: Tener un circuito no demuestra tener suficientes puntos de utilización.\nComprobación: Cuatro: 20/6 se redondea hacia arriba.\nConfusión frecuente: «Hay un C2» no demuestra que haya suficientes bases en cada estancia.",
          "references": [
            {
              "label": "ITC-BT-25 · §4, tabla 2",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-25"
            }
          ]
        },
        {
          "id": "v3-bt25-55",
          "title": "6. Automatización y recarga en vivienda",
          "text": "El mínimo de electrificación no significa un límite máximo de comodidad o de carga.\nC11 corresponde a automatización, gestión técnica de energía y seguridad. Reconocer ese circuito no acredita la modalidad especialista correspondiente de la empresa.\nC13 identifica el circuito de recarga del supuesto de vivienda. Se estudia con BT-52 para su previsión, ejecución y protecciones.\nNo mezcles C4 doméstico con modo 4 de recarga en continua. El nombre del circuito y el modo de carga pertenecen a mapas distintos.\nIdea clave: C11 y C13 describen circuitos; no son modalidades profesionales ni modos de recarga.\nComprobación: No. C13 es una denominación de circuito de vivienda; los modos de recarga son otra clasificación.\nConfusión frecuente: No mezcles C4, circuito doméstico, con modo 4 de recarga en continua.",
          "references": [
            {
              "label": "ITC-BT-25 · §§2, 3 y 4; tabla 1",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-25"
            }
          ]
        }
      ]
    },
    {
      "id": "bt26",
      "title": "Viviendas: ejecución de la instalación",
      "cards": [
        {
          "id": "v3-bt26-56",
          "title": "1. Conductores y separación de circuitos",
          "text": "La BT-25 dice qué prever; la BT-26 desarrolla su ejecución y protección.\nBT-25 y BT-26 se leen juntas: prever circuitos no agota las condiciones de montaje. En vivienda se emplean conductores de cobre, con secciones dimensionadas y mínimos correspondientes.\nNo se utiliza un mismo neutro para varios circuitos. La independencia del circuito también afecta a sus conductores y protecciones.\nEl verde-amarillo identifica protección. No se reutiliza como fase u otra función activa por disponer de un hilo sobrante.\nIdea clave: Cada circuito mantiene su neutro; verde-amarillo identifica protección.\nComprobación: No, conforme a la prescripción de BT-26.\nConfusión frecuente: No compartas neutros entre circuitos independientes. Azul no es verde-amarillo.",
          "references": [
            {
              "label": "ITC-BT-26 · §§2, 3, 4, 5 y 6; ITC-BT-19 y BT-24",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-26"
            }
          ]
        },
        {
          "id": "v3-bt26-57",
          "title": "2. Masas, conexiones y canalizaciones",
          "text": "La BT-25 dice qué prever; la BT-26 desarrolla su ejecución y protección.\nEl neutro se identifica en azul claro. La identificación ayuda, pero no prueba ausencia de tensión.\nLas masas se conectan mediante conductor de protección a la tierra de protección conforme a la medida aplicable. No se elimina esa conexión por tener diferencial.\nLas conexiones necesitan dispositivos adecuados al material, sección y condiciones, dentro de cajas apropiadas. Las canalizaciones se completan con BT-20 y BT-21: caber físicamente no garantiza protección ni tendido correcto.\nIdea clave: El diferencial no elimina la conexión de masas a protección.\nComprobación: No. Tienen funciones distintas y no se intercambian.\nConfusión frecuente: No compartas neutros entre circuitos independientes. Azul no es verde-amarillo.",
          "references": [
            {
              "label": "ITC-BT-26 · §§2, 3, 4, 5 y 6; ITC-BT-19 y BT-24",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-26"
            }
          ]
        },
        {
          "id": "v3-bt26-58",
          "title": "3. Baños y verificaciones finales",
          "text": "La BT-25 dice qué prever; la BT-26 desarrolla su ejecución y protección.\nEn baños se añaden las condiciones de BT-27, según volumen y equipo. Las reglas particulares se superponen a las generales de vivienda.\nAntes de la puesta en servicio se realizan las verificaciones y documentación reglamentarias. Encender los aparatos no prueba la continuidad de PE, el aislamiento o la actuación correcta de protecciones.\nCierra el ejercicio con la lista de comprobaciones aplicables, no con la frase «funciona».\nIdea clave: Que funcione no demuestra continuidad, aislamiento ni protección correctos.\nComprobación: No. La prueba funcional no acredita por sí sola aislamiento, PE ni actuación de protecciones.\nConfusión frecuente: No compartas neutros entre circuitos independientes. Azul no es verde-amarillo.",
          "references": [
            {
              "label": "ITC-BT-26 · §§2, 3, 4, 5 y 6; ITC-BT-19 y BT-24",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-26"
            }
          ]
        }
      ]
    },
    {
      "id": "bt27",
      "title": "Baños y duchas",
      "cards": [
        {
          "id": "banos",
          "title": "1. Dibujar los volúmenes del baño",
          "text": "BT-27: 0, 1, 2 y 3 en su geometría\nEl volumen 0 es el interior de bañera o plato en ese supuesto. Las delimitaciones habituales se estudian con sus figuras: altura 2,25 m; volumen 2, franja de 0,60 m; volumen 3, franja siguiente de 2,40 m.\nLas duchas sin plato o con difusor móvil tienen reglas geométricas específicas. No traslades una figura simplificada a cualquier baño.\nEn volumen 0, los equipos adecuados admitidos con MBTS tienen límite de 12 V CA o 30 V CC y fuente fuera de 0, 1 y 2 en el supuesto previsto. Se cumplen además las demás condiciones de la tabla.\nConsulta conjuntamente IP, canalizaciones y equipos. Las piscinas se estudian con BT-31, no copiando estos volúmenes.\nIdea clave: Primero sitúa el volumen; después comprueba qué equipo se admite.\nComprobación: No. Hay que respetar las restricciones de la tabla de BT-27.\nConfusión frecuente: Un diferencial 30 mA no permite un enchufe ordinario en cualquier volumen. Piscinas usan BT-31, no esta geometría.",
          "references": [
            {
              "label": "ITC-BT-27 · §2.1–2.2, tabla 1 y figuras",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-27"
            }
          ]
        },
        {
          "id": "v3-bt27-59",
          "title": "2. Geometría y MBTS en volumen 0",
          "text": "La posición del equipo respecto a la bañera o ducha decide las condiciones aplicables.\nEn bañera o ducha con plato, el volumen 0 es su interior. Para ducha sin plato, aplica la delimitación específica de BT-27 y sus figuras.\nDibuja distancias y alturas reales. No clasifiques una pared como «zona segura» por describirla de forma genérica o por añadir una mampara sin analizar la prescripción.\nEn MBTS para volumen 0, recuerda 12 V CA / 30 V CC y comprueba todos los demás requisitos. El equipo y la fuente importan tanto como la cifra de tensión.\nIdea clave: Una tensión reducida no basta para admitir un equipo en volumen 0.\nComprobación: 12 V CA o 30 V CC, con todas las condiciones del equipo, fuente y protección.\nConfusión frecuente: Los volúmenes de una piscina no se copian a un baño. Una mampara no permite inventar una zona exenta.",
          "references": [
            {
              "label": "ITC-BT-27 · §§2.1, 2.2, 2.3 y tabla 1",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-27"
            }
          ]
        },
        {
          "id": "v3-bt27-60",
          "title": "3. Fuente, IP, equipotencialidad y bases",
          "text": "La posición del equipo respecto a la bañera o ducha decide las condiciones aplicables.\nLa fuente de seguridad del supuesto estudiado se sitúa fuera de los volúmenes 0, 1 y 2. No confundas su ubicación con la del receptor.\nEl grado IP indica protección de envolvente. Comprueba el exigido y la admisión concreta del equipo en ese volumen, con las condiciones de uso e instrucciones.\nLa equipotencialidad reduce diferencias de potencial entre las partes que deban conectarse; no significa unir indiscriminadamente cualquier objeto metálico decorativo.\nLas bases respetan la tabla por volumen. Tener diferencial no convierte una ubicación prohibida en permitida.\nIdea clave: El lugar del receptor y el de su fuente se comprueban por separado.\nComprobación: Fuera de los volúmenes 0, 1 y 2.\nConfusión frecuente: Los volúmenes de una piscina no se copian a un baño. Una mampara no permite inventar una zona exenta.",
          "references": [
            {
              "label": "ITC-BT-27 · §§2.1, 2.2, 2.3 y tabla 1",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-27"
            }
          ]
        },
        {
          "id": "v3-bt27-61",
          "title": "4. Un orden para resolver casos de baño",
          "text": "La posición del equipo respecto a la bañera o ducha decide las condiciones aplicables.\nDibuja bañera o ducha y localiza el volumen real.\nConsulta qué equipos y canalizaciones se admiten.\nComprueba grado IP y medidas de protección.\nRevisa tensión y alimentación.\nSitúa la fuente cuando proceda y verifica las restantes condiciones.\nTodas las condiciones son acumulativas. Cumplir una cifra aislada —por ejemplo, 30 mA o 12 V— no prueba que el conjunto sea admisible.\nIdea clave: No elijas un equipo solo por su tensión o por llevar diferencial.\nComprobación: El volumen real y, después, su admisión y condiciones completas en la tabla.\nConfusión frecuente: Los volúmenes de una piscina no se copian a un baño. Una mampara no permite inventar una zona exenta.",
          "references": [
            {
              "label": "ITC-BT-27 · §§2.1, 2.2, 2.3 y tabla 1",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-27"
            }
          ]
        }
      ]
    },
    {
      "id": "bt28",
      "title": "Locales de pública concurrencia",
      "cards": [
        {
          "id": "publica",
          "title": "1. Cuándo un local es de pública concurrencia",
          "text": "Primero el uso; después el aforo\nPública concurrencia es una clasificación reglamentaria del local, no una impresión de que «entra mucha gente». BT-28 agrupa usos de espectáculos, recreativos, reunión, trabajo y sanitarios, entre otros.\nAlgunos usos entran cualquiera que sea su ocupación; otros dependen del número de personas. Por ejemplo, un teatro entra sin un mínimo de aforo. Busca el uso concreto en §1 antes de aplicar un umbral.\nEsta clasificación exige proyecto e inspección inicial sin límite de potencia en los supuestos de BT-04 y BT-05. Una instalación pequeña puede necesitarlos por su uso.\nIdea clave: La obligación depende del uso del local, además de su potencia y ocupación.\nComprobación: No. Su uso de pública concurrencia exige proyecto e inspección inicial sin límite de potencia.\nConfusión frecuente: Un local de poca potencia puede necesitar proyecto e inspección por su uso.",
          "references": [
            {
              "label": "ITC-BT-28 · §1",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-28"
            },
            {
              "label": "ITC-BT-04 · §3.1.i",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-4"
            },
            {
              "label": "ITC-BT-05 · §4.1.b",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-5"
            }
          ]
        },
        {
          "id": "emergencia",
          "title": "2. Qué debe iluminar la emergencia",
          "text": "Evacuación: 1 lx · antipánico: 0,5 lx\nEl lux (lx) mide la iluminación que llega a una superficie. El alumbrado de seguridad entra automáticamente cuando falla el normal o su tensión cae por debajo del 70 % de la nominal.\nEvacuación: al menos 1 lx en el suelo, en el eje de los pasos principales; debe mantenerse al menos una hora.\nEquipos manuales contra incendios y cuadros de alumbrado: 5 lx en los puntos indicados.\nAmbiente o antipánico: al menos 0,5 lx en el espacio definido, durante al menos una hora.\nAlto riesgo: el mayor entre 15 lx y el 10 % de la iluminación normal, durante el tiempo necesario para abandonar la actividad o zona con seguridad.\nAdemás del mínimo, comprueba la uniformidad y los lugares de medida de BT-28 §3.1.\nIdea clave: Cada función tiene un lugar de medida, un mínimo de iluminación y una duración.\nComprobación: 20 lx: el 10 % de 200 es 20, mayor que el otro mínimo de 15 lx.\nConfusión frecuente: El 70 % se refiere a tensión de entrada, no a autonomía ni a nivel de iluminación.",
          "references": [
            {
              "label": "ITC-BT-28 · §3.1.1–3.1.3",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-28"
            }
          ]
        },
        {
          "id": "lineas-publica",
          "title": "3. Repartir líneas para que un fallo no apague el local",
          "text": "Una línea no debe apagar más de un tercio\nEl alumbrado general debe repartirse para que el fallo de una línea no afecte a más de un tercio de las lámparas de las dependencias que se iluminan conjuntamente. Así se conserva parte de la luz si falla un circuito.\nPara emergencia alimentada desde una fuente central, BT-28 §3.4.2 añade:\nProtección de cada línea con automático de 10 A como máximo.\nNo más de 12 puntos de luz por línea.\nSi hay varios puntos de emergencia en una dependencia, reparto al menos en dos líneas, aunque sean menos de doce.\nLos cables también deben cumplir las condiciones de servicio y comportamiento al fuego aplicables.\nIdea clave: Repartir puntos entre líneas limita las consecuencias de una avería.\nComprobación: No. Al haber varios puntos en la dependencia se reparten al menos entre dos líneas, aunque sean menos de doce.\nConfusión frecuente: No trasladar esta regla de pública concurrencia a cualquier vivienda como «tres circuitos obligatorios de luz».",
          "references": [
            {
              "label": "ITC-BT-28 · §3.4.2 y §4",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-28"
            }
          ]
        },
        {
          "id": "suministros",
          "title": "4. Socorro, reserva y duplicado",
          "text": "15 % · 25 % · más del 50 % de potencia\nUn suministro complementario proporciona energía cuando falla el normal. El artículo 10 distingue tipos por la potencia mínima que pueden aportar respecto del suministro normal:\nSocorro: al menos el 15 %.\nReserva: al menos el 25 %.\nDuplicado: más del 50 %.\nEjemplo de cálculo: para 100 kW normales, reserva significa al menos 25 kW. No significa 25 minutos ni 25 % de batería.\nBT-28 §2.3 indica qué usos requieren cada suministro. Una luminaria autónoma de emergencia cumple su función de iluminación, pero no demuestra por sí sola que exista el suministro complementario exigido.\nIdea clave: Estos porcentajes comparan potencias; no describen horas de autonomía.\nComprobación: No. Duplicado exige una potencia superior al 50 %, no igual.\nConfusión frecuente: En duplicado el texto emplea superior al 50 %, no simplemente igual.",
          "references": [
            {
              "label": "REBT · art. 10",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099"
            },
            {
              "label": "ITC-BT-28 · §2.3",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-28"
            }
          ]
        },
        {
          "id": "v3-bt28-62",
          "title": "5. Recordar las cifras sin mezclarlas",
          "text": "1 lx para salir · 0,5 lx para orientarse · 5 lx en equipos\nRelaciona cada número con una tarea:\nSalir por el recorrido de evacuación: 1 lx en su eje, sobre el suelo.\nOrientarse en un espacio abierto: 0,5 lx de ambiente o antipánico en el espacio definido.\nEncontrar equipos contra incendios y cuadros de alumbrado: 5 lx en los puntos prescritos.\nEvacuación y antipánico deben mantener sus mínimos durante al menos una hora. El alto riesgo usa el mayor de 15 lx o el 10 % del alumbrado normal y tiene la duración necesaria para abandonar la actividad.\nAl resolver un test, subraya primero la función que pregunta y después el valor.\nIdea clave: Memoriza la función junto al número, nunca el número solo.\nComprobación: No. Antipánico exige 0,5 lx; los 5 lx corresponden a los equipos y cuadros indicados.\nConfusión frecuente: 1 lux, 0,5 lux y 5 lux no pertenecen al mismo lugar de medida.",
          "references": [
            {
              "label": "ITC-BT-28 · §§3.1.1, 3.1.2, 3.1.3 y 3.3",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-28"
            }
          ]
        }
      ]
    },
    {
      "id": "bt29",
      "title": "Riesgo de incendio o explosión",
      "cards": [
        {
          "id": "explosion",
          "title": "1. Qué representa una zona de riesgo",
          "text": "Gases: 0, 1, 2 · polvo: 20, 21, 22\nUna atmósfera explosiva puede aparecer cuando sustancias inflamables se mezclan con el aire en condiciones capaces de propagar una combustión. La clasificación considera su probabilidad de presencia y su duración.\nSe emplean las zonas 0, 1 y 2 para gases o vapores, y 20, 21 y 22 para polvo combustible. Dentro de cada serie, los números no significan «más número, más peligro».\nAntes de seleccionar equipos se debe disponer de una clasificación justificada del emplazamiento. Esta instalación pertenece a una modalidad especialista distinta de generadoras; preparar IBTE9 no amplía por sí solo esa competencia.\nIdea clave: La zona describe la presencia esperable de la atmósfera; sirve para seleccionar equipos adecuados.\nComprobación: A la de polvo combustible. Los gases y vapores utilizan 0, 1 y 2.\nConfusión frecuente: IP65 no acredita idoneidad para atmósfera explosiva. Estanqueidad y protección contra explosión son diferentes.",
          "references": [
            {
              "label": "ITC-BT-29 · §4–9",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-29"
            },
            {
              "label": "ITC-BT-03 · §3.2",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-3"
            }
          ]
        },
        {
          "id": "v3-bt29-63",
          "title": "2. Clase de emplazamiento y zona",
          "text": "Clase I: gases o vapores · clase II: polvo\nBT-29 distingue la clase del emplazamiento según el fenómeno que origina el riesgo:\nClase I: gases, vapores o nieblas inflamables; sus zonas son 0, 1 y 2.\nClase II: polvo combustible; sus zonas son 20, 21 y 22.\nDespués se determina la zona concreta en función de la presencia y duración previstas. Conocer la sustancia y cómo se libera es más importante que el aspecto visual de la sala.\nEstas clases describen el lugar. Las clases I, II y III de protección de receptores describen el aparato y son otra clasificación.\nIdea clave: Clase de emplazamiento y clase de protección del aparato son clasificaciones diferentes.\nComprobación: No. Su clase de protección eléctrica no acredita aptitud para la atmósfera explosiva del lugar.\nConfusión frecuente: Esta es otra modalidad especialista: aprobar generadoras no acredita por sí solo instalaciones con riesgo de explosión.",
          "references": [
            {
              "label": "ITC-BT-29 · §§1, 2, 4, 5, 6 y 7; ITC-BT-03 · §3.2",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-29"
            }
          ]
        },
        {
          "id": "v3-bt29-64",
          "title": "3. Elegir un equipo apto para la atmósfera",
          "text": "Zona, sustancia y temperatura deben ser compatibles\nEl código IP indica protección de la envolvente frente a sólidos y agua. Por ejemplo, IP65 no demuestra que un equipo pueda utilizarse en una atmósfera explosiva.\nPara esa selección se comprueban la clasificación del lugar, la documentación y el marcado del equipo, sus modos de protección y la compatibilidad con la sustancia y la zona.\nTambién importa la temperatura de sus superficies: puede convertirse en una fuente de ignición. No basta que el equipo cierre bien o funcione correctamente en un taller ordinario.\nLa decisión debe quedar justificada para el emplazamiento real, no por semejanza con otro producto.\nIdea clave: Estanqueidad frente a agua y polvo no equivale a protección contra explosiones.\nComprobación: Su aptitud específica para la atmósfera, zona, sustancia y temperatura del emplazamiento.\nConfusión frecuente: Esta es otra modalidad especialista: aprobar generadoras no acredita por sí solo instalaciones con riesgo de explosión.",
          "references": [
            {
              "label": "ITC-BT-29 · §§1, 2, 4, 5, 6 y 7; ITC-BT-03 · §3.2",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-29"
            }
          ]
        },
        {
          "id": "v3-bt29-65",
          "title": "4. Reconocer el límite de la habilitación",
          "text": "Cada modalidad especialista tiene su alcance\nLeer esta ITC ayuda a reconocer una instalación con riesgo de explosión y a saber dónde consultar sus exigencias. No acredita la modalidad profesional correspondiente.\nBT-03 define el alcance de las categorías y modalidades especialistas. La modalidad de instalaciones generadoras y la de locales con riesgo de incendio o explosión son diferentes.\nEn un caso de examen, identifica primero el tipo de instalación. En la actividad profesional, comprueba que la habilitación y la competencia cubren ese trabajo y que se dispone de la clasificación y documentación necesarias.\nIdea clave: Estudiar una instalación y estar habilitado para ejecutarla son situaciones distintas.\nComprobación: No. Debe estar acreditado el alcance especialista correspondiente a ese tipo de instalación.\nConfusión frecuente: Esta es otra modalidad especialista: aprobar generadoras no acredita por sí solo instalaciones con riesgo de explosión.",
          "references": [
            {
              "label": "ITC-BT-29 · §§1, 2, 4, 5, 6 y 7; ITC-BT-03 · §3.2",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-29"
            }
          ]
        }
      ]
    },
    {
      "id": "bt30",
      "title": "Locales de características especiales",
      "cards": [
        {
          "id": "humedos",
          "title": "1. Diferenciar húmedo y mojado",
          "text": "Húmedo: IPX1 · mojado: IPX4 en los elementos afectados\nUn local húmedo presenta condensación, manchas o moho sin paredes y techos impregnados ni aparición de gotas. Un local mojado presenta superficies impregnadas, gotas gruesas, lodo o vaho prolongado. BT-30 incluye la intemperie entre los emplazamientos mojados.\nPara las canalizaciones y aparamenta que indican sus apartados, la protección mínima frente al agua es IPX1 en húmedos e IPX4 en mojados. Deben leerse además las otras condiciones del elemento.\nLa X significa que esa expresión no especifica la primera cifra del IP; no significa necesariamente ausencia de protección frente a sólidos.\nIdea clave: Clasifica el ambiente antes de buscar el IP mínimo del elemento concreto.\nComprobación: Como emplazamiento mojado, sin perjuicio de otras prescripciones específicas de la instalación exterior.\nConfusión frecuente: IP frente al agua no sustituye protección contra choque eléctrico.",
          "references": [
            {
              "label": "ITC-BT-30 · §1–2",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-30"
            }
          ]
        },
        {
          "id": "v3-bt30-66",
          "title": "2. Leer los signos del ambiente",
          "text": "Condensación sin gotas y superficies impregnadas no son lo mismo\nPara clasificar el local, busca lo que describe el enunciado:\nCondensación o moho sin impregnación ni goteo: local húmedo.\nParedes o techos impregnados, gotas gruesas o vaho prolongado: local mojado.\nIntemperie: emplazamiento mojado según BT-30.\nQue una persona derrame agua una vez no describe por sí solo las condiciones habituales del ambiente.\nEjemplo: si una pregunta habla de condensación persistente pero aclara que no hay gotas ni superficies impregnadas, no cambies «húmedo» por «mojado» solo porque aparezca la palabra agua.\nIdea clave: Las condiciones descritas, y no el nombre comercial del local, determinan su clasificación.\nComprobación: No. Hay que distinguir condensación sin goteo de superficies impregnadas, gotas y otras condiciones de local mojado.\nConfusión frecuente: Un local húmedo y uno mojado no exigen automáticamente el mismo IP. La intemperie entra en el concepto de mojado de esta ITC.",
          "references": [
            {
              "label": "ITC-BT-30 · §§1, 2, 3, 4, 5, 6 y 7",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-30"
            }
          ]
        },
        {
          "id": "v3-bt30-67",
          "title": "3. Agua, corrosión, polvo y temperatura",
          "text": "Cada influencia externa exige una comprobación\nUna influencia externa es una condición del entorno que puede afectar al material. Repasa cuatro preguntas:\nAgua: ¿qué IP requiere el elemento? En el supuesto mojado, los elementos indicados exigen IPX4.\nCorrosión: ¿el material resiste el ambiente o necesita protección?\nPolvo: ¿solo afecta a la envolvente o puede crear riesgo de incendio o explosión y activar BT-29?\nTemperatura: ¿son adecuados el aislamiento y la capacidad de corriente del cable en esas condiciones?\nIP describe la envolvente e IK su resistencia a impactos; ninguno demuestra por sí solo aptitud térmica o química.\nIdea clave: No hay un único código que resuelva agua, impactos, corrosión y temperatura.\nComprobación: No. La aptitud térmica y las correcciones de intensidad se comprueban por separado.\nConfusión frecuente: Un local húmedo y uno mojado no exigen automáticamente el mismo IP. La intemperie entra en el concepto de mojado de esta ITC.",
          "references": [
            {
              "label": "ITC-BT-30 · §§1, 2, 3, 4, 5, 6 y 7",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-30"
            }
          ]
        },
        {
          "id": "v3-bt30-68",
          "title": "4. Locales de baterías: conocer la tecnología",
          "text": "Ventilación y riesgos según la batería\nUna batería no es solo una capacidad en kWh. La tecnología, la carga y las condiciones de uso determinan los riesgos que deben considerarse.\nEn locales de baterías se estudian la ventilación, las sustancias o gases que puedan generarse y las condiciones de instalación y mantenimiento. No se trata de la misma forma una batería de plomo y otro sistema con distinta química y protecciones.\nRelaciona BT-30 con las instrucciones del fabricante, las medidas de protección y la clasificación del lugar cuando corresponda. La presencia de baterías no permite asumir automáticamente un IP, una zona de explosión o una solución universal.\nIdea clave: Identifica la tecnología de la batería antes de elegir las medidas del local.\nComprobación: No. Se deben comprobar la tecnología, sus riesgos, las condiciones de funcionamiento y la documentación aplicable.\nConfusión frecuente: No todas las baterías generan los mismos riesgos ni requieren una solución de ventilación idéntica.",
          "references": [
            {
              "label": "ITC-BT-30 · §§1, 2, 3, 4, 5, 6 y 7",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-30"
            }
          ]
        }
      ]
    },
    {
      "id": "bt31",
      "title": "Piscinas y fuentes",
      "cards": [
        {
          "id": "piscinas",
          "title": "1. Antes de elegir un equipo, localiza el volumen",
          "text": "BT-31 tiene geometría y condiciones propias\nBT-31 define volúmenes alrededor de piscinas y fuentes. No uses el dibujo de una bañera de BT-27: la geometría y las condiciones son distintas.\nComo regla general para los volúmenes 0 y 1 de piscina, se utiliza muy baja tensión de seguridad (MBTS), hasta 12 V CA o 30 V CC, con su fuente fuera de los volúmenes 0, 1 y 2. La ITC contempla condiciones y excepciones que hay que leer completas.\nAdemás, el receptor debe estar admitido y ser apto para su volumen; una luminaria sumergida requiere ese servicio específico.\nProyecto: piscinas y fuentes con potencia superior a 5 kW. Inspección inicial específica de piscinas: potencia instalada superior a 10 kW.\nIdea clave: La tensión reducida es una parte de la protección, junto al volumen, la fuente y el equipo.\nComprobación: Supera el de proyecto (>5 kW), pero no el específico de inspección inicial de piscinas (>10 kW). Otros supuestos concurrentes pueden exigirla.\nConfusión frecuente: No trasladar los volúmenes de una bañera a una piscina ni confundir umbral de proyecto con inspección.",
          "references": [
            {
              "label": "ITC-BT-31 · §2–3",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-31"
            },
            {
              "label": "ITC-BT-04 · §3.1.n",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-4"
            },
            {
              "label": "ITC-BT-05 · §4.1.e",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-5"
            }
          ]
        },
        {
          "id": "v3-bt31-69",
          "title": "2. Volumen 0 y alimentación de seguridad",
          "text": "El volumen 0 es el interior del recipiente\nEl volumen 0 corresponde al interior del recipiente de la piscina. Los otros volúmenes se delimitan con las medidas y figuras de BT-31, atendiendo también a los elementos descritos en ella.\nEl lugar decide qué receptores y medidas de protección son admisibles. En la regla general de volúmenes 0 y 1 se emplea MBTS hasta 12 V en alterna o 30 V en continua.\nEjemplo de lectura: una lámpara que indica «12 V» todavía necesita comprobarse como luminaria apta para el servicio y el volumen, con la fuente ubicada correctamente. Su tensión nominal no completa toda la verificación.\nIdea clave: Primero delimita el volumen y después comprueba alimentación y equipo.\nComprobación: No. Debe ser apta y admitida para el servicio y volumen y cumplir las condiciones de su fuente y demás protecciones.\nConfusión frecuente: El diferencial no autoriza cualquier equipo en cualquier volumen. Proyecto e inspección inicial tienen umbrales distintos.",
          "references": [
            {
              "label": "ITC-BT-31 · §§1, 2 y 3; ITC-BT-04 · §3.1; ITC-BT-05 · §4.1",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-31"
            }
          ]
        },
        {
          "id": "v3-bt31-70",
          "title": "3. Fuente, equipotencialidad y equipo sumergido",
          "text": "La fuente y la luminaria no tienen la misma ubicación permitida\nLa fuente de alimentación convierte o suministra energía al receptor. Su emplazamiento permitido se comprueba aparte del de la luminaria; en la regla general citada de MBTS, se sitúa fuera de 0, 1 y 2.\nLa unión equipotencial suplementaria conecta las masas y elementos conductores extraños que indica la ITC para limitar diferencias de potencial. Se identifican esos elementos conforme a la prescripción, sin hacer uniones arbitrarias.\nLas luminarias sumergidas deben cumplir las condiciones de construcción, protección y servicio correspondientes.\nPara proyecto, el supuesto específico de piscinas y fuentes de BT-04 se activa con potencia superior a 5 kW.\nIdea clave: Comprueba por separado el receptor, su fuente y los elementos sujetos a equipotencialidad.\nComprobación: No. La ubicación de la fuente tiene restricciones propias que deben cumplirse.\nConfusión frecuente: El diferencial no autoriza cualquier equipo en cualquier volumen. Proyecto e inspección inicial tienen umbrales distintos.",
          "references": [
            {
              "label": "ITC-BT-31 · §§1, 2 y 3; ITC-BT-04 · §3.1; ITC-BT-05 · §4.1",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-31"
            }
          ]
        },
        {
          "id": "v3-bt31-71",
          "title": "4. Proyecto e inspección: dos preguntas distintas",
          "text": "Piscina: proyecto >5 kW · inspección inicial >10 kW\nEl proyecto es documentación técnica de diseño. La inspección inicial es una comprobación reglamentaria por el organismo de control que corresponde. No son el mismo trámite.\nBT-04: piscinas y fuentes, proyecto cuando la potencia es superior a 5 kW.\nBT-05: entrada específica de piscinas, inspección inicial cuando la potencia instalada es superior a 10 kW.\nEjemplo: 10 kW exactos superan 5 kW, pero no son «superiores a 10 kW». Antes de concluir, revisa si el uso u otro supuesto concurrente exige inspección.\nIdea clave: No intercambies un umbral de documentación con uno de inspección.\nComprobación: No. Ese supuesto exige potencia instalada superior a 10 kW, aunque puede haber otras causas de inspección.\nConfusión frecuente: El diferencial no autoriza cualquier equipo en cualquier volumen. Proyecto e inspección inicial tienen umbrales distintos.",
          "references": [
            {
              "label": "ITC-BT-31 · §§1, 2 y 3; ITC-BT-04 · §3.1; ITC-BT-05 · §4.1",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-31"
            }
          ]
        }
      ]
    },
    {
      "id": "bt32",
      "title": "Máquinas de elevación y transporte",
      "cards": [
        {
          "id": "v3-bt32-72",
          "title": "1. Corte general e identificación de la máquina",
          "text": "Corte omnipolar y equipo claramente identificado\nBT-32 abarca máquinas de elevación y transporte; no se limita al ascensor de una vivienda. Su alimentación debe disponer del corte omnipolar prescrito, situado e identificado para utilizarlo correctamente.\nLa identificación del equipo correspondiente debe ser clara e indeleble: evita que una persona corte otra máquina por error.\nEn el arranque de motores, el apartado limita al 5 % la caída de tensión en el supuesto descrito. Es una condición durante el arranque, además del dimensionado ordinario del cable y los límites de los otros tramos.\nIdea clave: El dispositivo debe cortar la alimentación prevista y permitir identificar sin duda qué máquina gobierna.\nComprobación: No. Es el límite del supuesto de arranque indicado; los demás tramos y condiciones mantienen sus reglas.\nConfusión frecuente: Un contactor admitido como interruptor no se utiliza como seccionamiento. Ruedas y rodillos no valen como conexión del PE.",
          "references": [
            {
              "label": "ITC-BT-32 · §§1, 2, 4, 5 y 6",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-32"
            }
          ]
        },
        {
          "id": "v3-bt32-73",
          "title": "2. Parar, seccionar y evitar el reenganche",
          "text": "Un contactor no es un seccionador\nEl mando normal arranca o para la máquina. El seccionamiento proporciona la separación de la alimentación necesaria para las actuaciones previstas. Son funciones diferentes.\nUn contactor admitido para interrupción funcional no se utiliza como seccionamiento. La pérdida de control debe producir la parada automática del aparato en las condiciones de BT-32.\nEl bloqueo u otras medidas prescritas deben impedir una puesta en servicio no autorizada.\nCuando el PE se transmite por colector, se dispone mediante un anillo o barra individual claramente distinguible de los conductores activos. La alimentación móvil no elimina esa conexión protectora.\nIdea clave: Una máquina parada puede seguir eléctricamente conectada; seccionamiento y bloqueo cumplen otras funciones.\nComprobación: No. BT-32 no admite el contactor para seccionamiento; se necesita la separación prevista para esa función.\nConfusión frecuente: Un contactor admitido como interruptor no se utiliza como seccionamiento. Ruedas y rodillos no valen como conexión del PE.",
          "references": [
            {
              "label": "ITC-BT-32 · §§1, 2, 4, 5 y 6",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-32"
            }
          ]
        },
        {
          "id": "v3-bt32-74",
          "title": "3. La conexión protectora debe ser fiable",
          "text": "Ruedas y rodillos no valen como PE\nEl PE, conductor de protección, permite la medida de protección de las masas frente a un defecto. Su conexión debe conservarse con las condiciones de continuidad y fiabilidad exigidas.\nBT-32 no admite ruedas o rodillos como conexión del PE. Su contacto mecánico puede variar, ensuciarse o perder continuidad; que sean metálicos no los convierte en un conductor de protección.\nEl PE tampoco debe transportar la corriente de funcionamiento normal: no sustituye a una fase o al neutro de alimentación.\nAl estudiar un esquema, identifica por dónde se transmite cada conductor activo y por dónde la conexión protectora.\nIdea clave: La protección no puede depender de un contacto mecánico variable entre ruedas y carriles.\nComprobación: No. BT-32 excluye ruedas y rodillos como conexión del conductor de protección.\nConfusión frecuente: Un contactor admitido como interruptor no se utiliza como seccionamiento. Ruedas y rodillos no valen como conexión del PE.",
          "references": [
            {
              "label": "ITC-BT-32 · §§1, 2, 4, 5 y 6",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-32"
            }
          ]
        }
      ]
    },
    {
      "id": "bt33",
      "title": "Instalaciones provisionales de obras",
      "cards": [
        {
          "id": "temporales",
          "title": "1. Obra temporal: mismas obligaciones de seguridad",
          "text": "BT-33 para obras · BT-34 para ferias y stands\nBT-33 regula instalaciones provisionales y temporales de obras; BT-34, las de ferias y stands. «Temporal» describe la duración del montaje, no una exención del reglamento.\nIdentifica el origen de la energía, los cuadros, las tomas y el recorrido de cables. Comprueba humedad, golpes, aplastamiento, tracción y paso de personas o vehículos.\nSe mantienen la puesta a tierra y las medidas de protección, documentación y verificación aplicables. BT-04 exige proyecto para los supuestos temporales del grupo d cuando la potencia supera 50 kW; pueden concurrir otras causas.\nEn el test, distingue primero obra de feria y después el requisito concreto.\nIdea clave: Una instalación provisional debe seguir siendo segura y estar documentada cuando corresponda.\nComprobación: No. La temporalidad no elimina las exigencias aplicables de protección, verificación y documentación.\nConfusión frecuente: No confundir provisional con «puede hacerse sin reglamento».",
          "references": [
            {
              "label": "ITC-BT-33 · §1–4",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-33"
            },
            {
              "label": "ITC-BT-34",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-34"
            },
            {
              "label": "ITC-BT-04 · §3.1.d",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-4"
            }
          ]
        },
        {
          "id": "v3-bt33-75",
          "title": "2. Varias fuentes en una misma obra",
          "text": "Identificar la fuente y evitar interconexiones indebidas\nBT-33 comprende construcción, reparación, ampliación, demolición, excavación y trabajos similares cuando requieren instalación temporal.\nUna obra puede recibir energía de varias fuentes, incluidos generadores. Cada instalación debe identificarse por su fuente y las alimentaciones deben conectarse mediante dispositivos que impidan su interconexión.\nPara protección por corte automático en esquema TT, la tensión límite convencional de contacto no supera 24 V eficaces en CA o 60 V en CC. Es un límite de contacto usado en la medida protectora, no la tensión nominal del suministro.\nCortar una fuente no demuestra ausencia de tensión en un equipo alimentado desde otra.\nIdea clave: Con varias fuentes, identifica y separa las alimentaciones antes de analizar la protección.\nComprobación: No. Son la tensión límite convencional de contacto para la medida de protección TT indicada.\nConfusión frecuente: La obra puede tener varias fuentes, pero no deben quedar interconectadas por un montaje improvisado.",
          "references": [
            {
              "label": "ITC-BT-33 · §§1, 2, 3, 4 y 5; ITC-BT-04 · §3.1",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-33"
            }
          ]
        },
        {
          "id": "v3-bt33-76",
          "title": "3. Bases, intemperie y trazado de cables",
          "text": "Diferencial ≤30 mA para bases o alternativas admitidas\nCada base o grupo de bases de toma de corriente debe protegerse con diferencial de 30 mA como máximo, o mediante MBTS, o separación eléctrica con transformador individual en las condiciones de la ITC.\nLas envolventes, aparamenta, tomas y elementos de instalación a la intemperie tienen un mínimo IP45. Para otros equipos se consideran sus influencias externas.\nEvita tender cables por pasos de peatones o vehículos. Si es necesario, se exige protección especial frente a daños mecánicos y contactos con la construcción.\nEl tendido y la sujeción no deben transmitir esfuerzos a conexiones que no están diseñadas para soportarlos.\nIdea clave: En la obra hay que proteger tanto a las personas como a los cables y conexiones expuestos.\nComprobación: No. Debe evitarse ese trazado y, si es necesario, disponer la protección especial prescrita.\nConfusión frecuente: La obra puede tener varias fuentes, pero no deben quedar interconectadas por un montaje improvisado.",
          "references": [
            {
              "label": "ITC-BT-33 · §§1, 2, 3, 4 y 5; ITC-BT-04 · §3.1",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-33"
            }
          ]
        },
        {
          "id": "v3-bt33-77",
          "title": "4. Cuando perder la alimentación crea otro peligro",
          "text": "Prever los servicios de seguridad necesarios\nLa protección eléctrica no es el único riesgo de una obra. Si el fallo de un circuito o aparato puede poner en peligro a las personas, BT-33 exige prever las instalaciones de seguridad necesarias.\nEl alumbrado de seguridad permite evacuar y ejecutar las medidas previstas cuando falla el normal. Otros circuitos pueden mantener servicios esenciales, como los equipos que cita la ITC, con su alimentación y protección particulares.\nEjemplo de estudio: si se describe una zona donde la oscuridad impide salir con seguridad, comprueba la necesidad y el diseño del alumbrado de seguridad. No basta afirmar que «el diferencial funciona».\nIdea clave: El diseño debe contemplar las consecuencias de perder la energía, además de los defectos eléctricos.\nComprobación: La instalación de alumbrado de seguridad y las medidas previstas para permitir la evacuación.\nConfusión frecuente: La obra puede tener varias fuentes, pero no deben quedar interconectadas por un montaje improvisado.",
          "references": [
            {
              "label": "ITC-BT-33 · §§1, 2, 3, 4 y 5; ITC-BT-04 · §3.1",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-33"
            }
          ]
        }
      ]
    },
    {
      "id": "bt34",
      "title": "Ferias y stands",
      "cards": [
        {
          "id": "v3-bt34-78",
          "title": "1. Proteger envolventes y tomas de suelo",
          "text": "Interior IP4X · exterior IP45 · toma de suelo IK10\nBT-34 se aplica a instalaciones temporales de ferias, exposiciones, stands, alumbrados festivos y usos análogos.\nLa aparamenta de mando y protección se sitúa en envolventes cerradas que se abren con útil o llave, salvo los accionamientos manuales previstos. Para las canalizaciones y envolventes del apartado:\nInterior: IP4X.\nExterior: IP45.\nTomas de suelo: protección frente a entrada de agua y, además, IK10 frente a impactos.\nIP mide protección de envolvente e IK resistencia a impactos. Deben comprobarse ambos cuando se exigen; uno no sustituye al otro.\nIdea clave: Una toma de suelo necesita resistencia al impacto además de la protección de envolvente.\nComprobación: No. IK indica resistencia a impactos; la protección frente al agua se verifica mediante el IP y la envolvente requerida.\nConfusión frecuente: Temporal no es sin proyecto por definición. Las bases múltiples tienen una excepción concreta, no una autorización general.",
          "references": [
            {
              "label": "ITC-BT-34 · §§1 y 6.1 a 6.7; ITC-BT-04 · §3.1",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-34"
            }
          ]
        },
        {
          "id": "v3-bt34-79",
          "title": "2. Bases múltiples, focos y emergencia",
          "text": "La excepción de regletas tiene condiciones\nNo se utilizan adaptadores multivía. BT-34 permite la excepción de bases múltiples móviles alimentadas desde una base fija con cable de longitud máxima de 2 m; no es un permiso para encadenar cualquier adaptador.\nLos focos y equipos calientes deben fijarse y mantenerse suficientemente separados de materiales combustibles. Una luz que funciona puede estar calentando peligrosamente un tejido cercano.\nLas instalaciones temporales interiores que puedan albergar más de 100 personas requieren alumbrado de seguridad conforme a BT-28 por el supuesto de §6.4.2. Revisa también las otras obligaciones que puedan concurrir.\nIdea clave: Revisa la conexión, el calor y la evacuación, además de que los receptores funcionen.\nComprobación: No. Se limita a bases múltiples móviles alimentadas desde una base fija con cable de hasta 2 m.\nConfusión frecuente: Temporal no es sin proyecto por definición. Las bases múltiples tienen una excepción concreta, no una autorización general.",
          "references": [
            {
              "label": "ITC-BT-34 · §§1 y 6.1 a 6.7; ITC-BT-04 · §3.1",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-34"
            }
          ]
        },
        {
          "id": "v3-bt34-80",
          "title": "3. Circuito de iluminación y alimentación por generador",
          "text": "Mando de emergencia y puesta a tierra correcta\nEl apartado de interruptores de emergencia prescribe un circuito independiente para las luminarias y el alumbrado de vitrinas, controlado mediante un interruptor de emergencia. Ese mando cumple una función distinta del encendido decorativo habitual.\nSi se utiliza un generador, hay que resolver correctamente la puesta a tierra y el esquema de protección TN, TT o IT que corresponda conforme a BT-34 §6.5.\nUn generador cambia el origen de la alimentación; no elimina la protección contra choques, las sobreintensidades ni las verificaciones del montaje temporal.\nIdea clave: El origen de la energía y los mandos de emergencia forman parte del diseño de seguridad.\nComprobación: No. Deben comprobarse para el esquema y las condiciones de esa alimentación.\nConfusión frecuente: Temporal no es sin proyecto por definición. Las bases múltiples tienen una excepción concreta, no una autorización general.",
          "references": [
            {
              "label": "ITC-BT-34 · §§1 y 6.1 a 6.7; ITC-BT-04 · §3.1",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-34"
            }
          ]
        }
      ]
    },
    {
      "id": "bt35",
      "title": "Establecimientos agrícolas y hortícolas",
      "cards": [
        {
          "id": "v3-bt35-81",
          "title": "1. Qué comprende BT-35",
          "text": "Instalaciones fijas agrícolas; locales habitables excluidos\nBT-35 se aplica a instalaciones fijas de los establecimientos agrícolas y hortícolas que describe: cuadras, establos, gallineros, preparación de piensos, graneros y usos relacionados, así como emplazamientos exteriores previstos.\nLos locales habitables quedan excluidos de este ámbito específico. Esto no los excluye del REBT: se aplicarán sus reglas de vivienda u otras que correspondan.\nEl detalle técnico se remite a UNE 20.460-7-705 en el literal de la ITC. Consulta la referencia y edición aplicables en BT-02 y el material autorizado que desarrolla la norma.\nIdea clave: La ITC delimita el ámbito; las prescripciones particulares se desarrollan en la norma a la que remite.\nComprobación: Sí. Aparece entre los ejemplos del ámbito de establecimientos agrícolas y hortícolas.\nConfusión frecuente: No inventes una tabla de distancias o sensibilidades como si estuviera escrita en BT-35. Los locales habitables están excluidos de su campo específico.",
          "references": [
            {
              "label": "ITC-BT-35 · §§1 y 2; ITC-BT-02; reglas relacionadas BT-19, BT-24, BT-29 y BT-30",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-35"
            }
          ]
        },
        {
          "id": "v3-bt35-82",
          "title": "2. Encontrar la regla particular correcta",
          "text": "Remisión a norma y edición aplicable\nUna remisión normativa significa que el detalle se establece en otra referencia. BT-35 remite a la norma agrícola y hortícola; este curso no reproduce íntegramente su contenido.\nPara los apartados que esa norma citada tiene en estudio, el texto de BT-35 remite a BT-33. Esa remisión es limitada: no convierte toda la explotación en una instalación provisional de obra.\nVerifica en BT-02 la referencia, edición y condiciones aplicables. En los puntos donde hay animales y condiciones ambientales especiales, estudia las medidas particulares en la norma o documentación docente autorizada.\nIdea clave: La remisión a BT-33 se limita a los apartados previstos; no sustituye todas las reglas agrícolas.\nComprobación: No. La remisión expresa se limita a los apartados de la norma citada que se encuentran en estudio.\nConfusión frecuente: No inventes una tabla de distancias o sensibilidades como si estuviera escrita en BT-35. Los locales habitables están excluidos de su campo específico.",
          "references": [
            {
              "label": "ITC-BT-35 · §§1 y 2; ITC-BT-02; reglas relacionadas BT-19, BT-24, BT-29 y BT-30",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-35"
            }
          ]
        },
        {
          "id": "v3-bt35-83",
          "title": "3. Añadir las reglas generales y los riesgos concurrentes",
          "text": "Agrícola no elimina polvo combustible ni cálculo del cable\nEl uso agrícola no borra otros riesgos. Si el polvo puede originar una atmósfera explosiva, hay que estudiar la clasificación y las prescripciones de BT-29, incluida la competencia profesional necesaria.\nEl dimensionado del cable sigue necesitando comprobar intensidad admisible, caída de tensión y protección, con las condiciones reales de temperatura, montaje y ambiente.\nRelaciona cada pregunta con su origen: uso agrícola → BT-35 y norma particular; ambiente húmedo o corrosivo → condiciones pertinentes; explosión → BT-29; cálculo y protección → reglas generales y particulares aplicables.\nIdea clave: Las reglas particulares se añaden a las generales y a otros riesgos que puedan concurrir.\nComprobación: No. Si existe riesgo de atmósfera explosiva deben aplicarse también las prescripciones correspondientes de BT-29.\nConfusión frecuente: No inventes una tabla de distancias o sensibilidades como si estuviera escrita en BT-35. Los locales habitables están excluidos de su campo específico.",
          "references": [
            {
              "label": "ITC-BT-35 · §§1 y 2; ITC-BT-02; reglas relacionadas BT-19, BT-24, BT-29 y BT-30",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-35"
            }
          ]
        }
      ]
    },
    {
      "id": "bt36",
      "title": "Muy baja tensión",
      "cards": [
        {
          "id": "mbt",
          "title": "1. MBTS, MBTP y MBTF: tres sistemas diferentes",
          "text": "Seguridad · protección · funcional\nLas tres siglas significan muy baja tensión de seguridad (MBTS), de protección (MBTP) y funcional (MBTF).\nMBTS: fuente y circuitos con aislamiento de protección, sin conexión intencionada a tierra de circuitos o masas.\nMBTP: también requiere fuente y separación protectoras, pero admite la conexión a tierra prevista por su configuración.\nMBTF: no cumple todas las condiciones de las anteriores y necesita las medidas de protección de BT-24 que correspondan.\nNo confundas estas medidas con la clase I, II o III de un receptor ni con su código IP.\nIdea clave: La tensión nominal es solo una condición: fuente, separación y tierra definen el sistema.\nComprobación: No. Al no cumplir todas las condiciones de MBTS o MBTP requiere las medidas de protección correspondientes de BT-24.\nConfusión frecuente: Un autotransformador no aporta separación de protección por el solo hecho de reducir tensión.",
          "references": [
            {
              "label": "ITC-BT-36 · §2–3",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-36"
            },
            {
              "label": "ITC-BT-24 · §2 y §4.5",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-24"
            },
            {
              "label": "ITC-BT-43 · §2.2",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-43"
            }
          ]
        },
        {
          "id": "v3-bt36-84",
          "title": "2. Límites literales y puesta a tierra en MBTS",
          "text": "BT-36 §1: 50 V CA y 75 V CC\nEn la definición literal de BT-36 §1, las instalaciones MBTS, MBTP y MBTF tienen tensión nominal que no excede de 50 V CA o 75 V CC.\nOtros apartados y referencias utilizan límites diferentes, y algunas ITC particulares exigen tensiones mucho menores. Al resolver un test, identifica exactamente qué definición pregunta.\nEn MBTS, circuitos y masas no se conectan intencionadamente a tierra ni a un conductor de protección. Esa condición se combina con el aislamiento de protección de la fuente y de los circuitos.\nIdea clave: Responde a la definición concreta y no intercambies límites de apartados diferentes.\nComprobación: 75 V CC. No se sustituye por otro límite usado en un contexto diferente.\nConfusión frecuente: La definición literal de BT-36 §1 usa 50 V CA / 75 V CC. No sustituyas ese 75 por 120 cuando preguntan por este apartado.",
          "references": [
            {
              "label": "ITC-BT-36 · §§1, 2, 3 y 4; ITC-BT-24",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-36"
            }
          ]
        },
        {
          "id": "v3-bt36-85",
          "title": "3. Fuente y separación: por qué no basta reducir tensión",
          "text": "Un autotransformador no aporta separación protectora\nMBTP permite la conexión a tierra prevista de circuitos o masas, manteniendo las condiciones de fuente y aislamiento de protección. MBTF es funcional y no cumple todos esos requisitos.\nUna fuente de MBTS o MBTP debe incorporar el aislamiento de protección exigido o ser una fuente equivalente admitida. Un autotransformador comparte devanado y no aporta separación protectora solo por reducir tensión.\nLos circuitos deben conservar la separación requerida frente a los de otras tensiones, mediante las disposiciones admitidas de aislamiento o separación. La salida de 24 V de un equipo no demuestra por sí sola que el sistema sea MBTS.\nIdea clave: Reducir tensión y separar eléctricamente con protección son funciones distintas.\nComprobación: No. La reducción de tensión no garantiza el aislamiento de protección exigido.\nConfusión frecuente: La definición literal de BT-36 §1 usa 50 V CA / 75 V CC. No sustituyas ese 75 por 120 cuando preguntan por este apartado.",
          "references": [
            {
              "label": "ITC-BT-36 · §§1, 2, 3 y 4; ITC-BT-24",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-36"
            }
          ]
        },
        {
          "id": "v3-bt36-86",
          "title": "4. La ITC particular puede exigir menos tensión",
          "text": "El máximo general no autoriza todos los emplazamientos\nLa clasificación como MBTS no termina el análisis. El emplazamiento puede imponer un límite de tensión menor y otras restricciones.\nPor ejemplo, la regla general de volúmenes 0 y 1 de piscina en BT-31 limita la MBTS a 12 V CA o 30 V CC, con condiciones de fuente y equipos. No se puede usar allí el máximo literal de BT-36 como autorización general.\nOrden de estudio: comprueba sistema y fuente → identifica emplazamiento y volumen → lee tensión permitida y equipo admitido → revisa las demás condiciones.\nIdea clave: Las condiciones de MBTS se cumplen junto con las restricciones del lugar donde se utiliza.\nComprobación: No. Se deben cumplir además los límites y condiciones particulares de BT-31.\nConfusión frecuente: La definición literal de BT-36 §1 usa 50 V CA / 75 V CC. No sustituyas ese 75 por 120 cuando preguntan por este apartado.",
          "references": [
            {
              "label": "ITC-BT-36 · §§1, 2, 3 y 4; ITC-BT-24",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-36"
            }
          ]
        }
      ]
    },
    {
      "id": "bt37",
      "title": "Tensiones especiales",
      "cards": [
        {
          "id": "v3-bt37-87",
          "title": "1. Cuándo la tensión es especial",
          "text": "Superior a 500 V CA o 750 V CC\nBT-37 considera tensiones especiales las nominales superiores a 500 V eficaces en CA o 750 V de valor medio en CC, dentro del ámbito del REBT.\nEl ámbito general de baja tensión alcanza 1.000 V CA y 1.500 V CC. Por tanto, «especial» no significa automáticamente «alta tensión».\n500 V CA exactos: no superan este umbral.\n690 V CA: baja tensión y tensión especial.\n750 V CC exactos: no superan este umbral.\nLa palabra superior cambia la respuesta en los casos de igualdad.\nIdea clave: Una tensión especial puede seguir dentro de baja tensión; compara ambos límites.\nComprobación: No. Están dentro del REBT y en el supuesto de tensión especial de BT-37.\nConfusión frecuente: El umbral de BT-37 es superior a 500 V CA o a 750 V CC; la igualdad no entra por ese criterio.",
          "references": [
            {
              "label": "ITC-BT-37 · §§1 y 2; REBT · art. 2; ITC-BT-04 · §3.1",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-37"
            }
          ]
        },
        {
          "id": "v3-bt37-88",
          "title": "2. Precauciones que se añaden a las generales",
          "text": "Aislamiento del cable no inferior a 1.000 V\nEjemplo: 900 V CC siguen dentro de baja tensión y superan el umbral especial de 750 V CC.\nBT-37 añade condiciones a las reglas generales y a las del emplazamiento:\nCables de tensión nominal no inferior a 1.000 V, con las condiciones de instalación indicadas.\nProtección contra contactos indirectos de las partes prescritas.\nRestricción de piezas desnudas en tensión que no estén completamente protegidas: solo en locales afectos a servicio eléctrico y con acceso limitado a personal cualificado, conforme al apartado.\nEsta excepción de acceso no autoriza a dejar partes activas al alcance del público.\nIdea clave: La tensión especial añade precauciones y no elimina las reglas del ambiente o protección.\nComprobación: No. Debe cumplir la tensión nominal mínima y las demás condiciones exigidas para ese uso.\nConfusión frecuente: El umbral de BT-37 es superior a 500 V CA o a 750 V CC; la igualdad no entra por ese criterio.",
          "references": [
            {
              "label": "ITC-BT-37 · §§1 y 2; REBT · art. 2; ITC-BT-04 · §3.1",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-37"
            }
          ]
        },
        {
          "id": "v3-bt37-89",
          "title": "3. Identificar líneas y prever proyecto",
          "text": "Tensiones especiales: proyecto sin límite de potencia\nLas canalizaciones a tensiones especiales deben ser fácilmente identificables, especialmente cuando están próximas a otras de tensión usual o muy baja. Evita confundir líneas al interpretar el esquema o actuar sobre la instalación.\nBT-04 exige proyecto sin límite de potencia para instalaciones a tensiones especiales. La obligación nace del tipo de instalación y no de que alcance muchos kW.\nEjemplo de examen: una instalación de poca potencia a 690 V CA sigue entrando en tensión especial. Reducir su potencia no cambia el umbral de tensión ni la causa de proyecto.\nIdea clave: Una potencia pequeña no elimina los requisitos asociados a la tensión especial.\nComprobación: No. El supuesto de tensiones especiales requiere proyecto sin límite de potencia.\nConfusión frecuente: El umbral de BT-37 es superior a 500 V CA o a 750 V CC; la igualdad no entra por ese criterio.",
          "references": [
            {
              "label": "ITC-BT-37 · §§1 y 2; REBT · art. 2; ITC-BT-04 · §3.1",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-37"
            }
          ]
        }
      ]
    },
    {
      "id": "bt38",
      "title": "Quirófanos y salas de intervención",
      "cards": [
        {
          "id": "v3-bt38-90",
          "title": "1. Protección y continuidad en quirófanos",
          "text": "Transformador de aislamiento y vigilancia según el diseño\nBT-38 regula quirófanos y salas de intervención. La protección eléctrica debe coordinarse con la continuidad de servicios esenciales; no se diseña como un cuadro doméstico.\nEl sistema prescrito incluye el transformador de aislamiento y la vigilancia del nivel de aislamiento en los circuitos correspondientes. La vigilancia supervisa y señala su estado; no es un simple interruptor de encendido.\nLa puesta a tierra y la equipotencialidad tienen condiciones específicas para limitar diferencias de potencial.\nEs una modalidad especialista distinta de generadoras. Esta sección sirve para comprender su ubicación y exigencias; no acredita ese alcance profesional.\nIdea clave: En el entorno médico se coordinan protección, continuidad, vigilancia y equipotencialidad.\nComprobación: No. Supervisa y señala el estado de aislamiento de los circuitos correspondientes.\nConfusión frecuente: Es otra modalidad especialista. Una revisión anual no sustituye los controles semanales ni los mensuales.",
          "references": [
            {
              "label": "ITC-BT-38 · §§1, 2.1, 2.4 y 3; ITC-BT-03 · §3.2; ITC-BT-05",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-38"
            }
          ]
        },
        {
          "id": "v3-bt38-91",
          "title": "2. Controles semanales, mensuales y revisión anual",
          "text": "Cada frecuencia corresponde a una comprobación\nBT-38 distingue tareas que no se sustituyen entre sí:\nAl menos semanal: control del funcionamiento de la vigilancia de aislamiento y de los dispositivos de protección.\nComo mínimo mensual: medidas de continuidad y resistencia de aislamiento de los circuitos interiores correspondientes.\nAnual: revisión de la instalación por la empresa instaladora prevista, además de las inspecciones periódicas de BT-05.\nCada quirófano o sala debe disponer de su libro de mantenimiento, con actuaciones e incidencias. En el test, asocia la frecuencia a la tarea exacta.\nIdea clave: Una revisión anual no reemplaza los controles semanales ni las medidas mensuales.\nComprobación: Mensualmente; el control funcional de vigilancia y protección tiene una frecuencia al menos semanal.\nConfusión frecuente: Es otra modalidad especialista. Una revisión anual no sustituye los controles semanales ni los mensuales.",
          "references": [
            {
              "label": "ITC-BT-38 · §§1, 2.1, 2.4 y 3; ITC-BT-03 · §3.2; ITC-BT-05",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-38"
            }
          ]
        },
        {
          "id": "v3-bt38-92",
          "title": "3. Receptores invasivos y no invasivos",
          "text": "El tipo de receptor determina su alimentación\nLos equipos de asistencia vital y los receptores de uso invasivo con contacto eléctrico con el paciente se conectan mediante el transformador de aislamiento previsto en BT-38. Sus masas se conectan al embarrado de protección y a la tierra general del edificio según la prescripción.\nLos receptores no invasivos se tratan conforme a las reglas generales de BT-43 y las condiciones aplicables.\nNo asignes el mismo tratamiento a todos los aparatos solo por estar en un hospital. Lee la función del receptor, el contacto con el paciente y el circuito al que pertenece.\nIdea clave: La clasificación del receptor médico cambia las condiciones de alimentación y protección.\nComprobación: No. Se distingue el uso invasivo o de asistencia vital y el de receptores no invasivos, además del ámbito concreto de BT-38.\nConfusión frecuente: Es otra modalidad especialista. Una revisión anual no sustituye los controles semanales ni los mensuales.",
          "references": [
            {
              "label": "ITC-BT-38 · §§1, 2.1, 2.4 y 3; ITC-BT-03 · §3.2; ITC-BT-05",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-38"
            }
          ]
        }
      ]
    },
    {
      "id": "bt39",
      "title": "Cercas eléctricas para ganado",
      "cards": [
        {
          "id": "v3-bt39-93",
          "title": "1. Alimentador específico y su energía de entrada",
          "text": "La cerca recibe impulsos, no una conexión directa a la red\nEl alimentador de cerca suministra regularmente impulsos de tensión al conductor de la barrera. La cerca no se conecta directamente a la red como una fase accesible.\nEl alimentador puede recibir energía de la red, de baterías cargadas desde ella o de baterías autónomas, según las formas previstas. En todos los casos mantiene sus requisitos propios.\nCuando se conecta a red, su circuito de alimentación cumple BT-22, BT-23 y BT-24: sobreintensidades, sobretensiones y choque eléctrico.\nSe instala próximo a la cerca y donde no pueda quedar cubierto por paja, heno u otros materiales indicados.\nIdea clave: El equipo específico transforma la alimentación en los impulsos previstos para la cerca.\nComprobación: No. La batería es una posible fuente de energía del alimentador, no una conexión directa admitida al conductor de la cerca.\nConfusión frecuente: La tierra del alimentador debe ser separada. No utilices los apoyos de otra canalización.",
          "references": [
            {
              "label": "ITC-BT-39 · §§1, 2 y 3",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-39"
            }
          ]
        },
        {
          "id": "v3-bt39-94",
          "title": "2. Apoyos, puertas y separación entre cercas",
          "text": "Evitar contacto simultáneo y advertir cada tramo\nLos conductores de la cerca y de su conexión no se sujetan en apoyos de otras canalizaciones, incluidas eléctricas o de telecomunicación.\nLas puertas deben tener elementos de maniobra aislados y poner fuera de tensión los conductores comprendidos entre sus soportes laterales al maniobrarlas.\nEntre cercas de distintos alimentadores hay que impedir que una persona o animal las toque simultáneamente. El texto considera normalmente suficiente una separación de 2 m.\nLa señalización requiere al menos un cartel por alineación recta y, en todo caso, una distancia máxima entre carteles de 50 m.\nIdea clave: Las medidas buscan evitar contactos simultáneos y que la cerca pase inadvertida.\nComprobación: No. Se exige al menos un cartel por alineación recta, además de la distancia máxima de 50 m.\nConfusión frecuente: La tierra del alimentador debe ser separada. No utilices los apoyos de otra canalización.",
          "references": [
            {
              "label": "ITC-BT-39 · §§1, 2 y 3",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-39"
            }
          ]
        },
        {
          "id": "v3-bt39-95",
          "title": "3. Avisos visibles y tierra separada",
          "text": "La tierra de cerca no se une arbitrariamente a otras tierras\nSe colocan carteles visibles cuando la cerca puede ser alcanzada por personas que no conocen su presencia y, en todo caso, cuando está junto a una vía pública. Deben resultar visibles desde el exterior y el interior conforme a la colocación prevista.\nLa toma de tierra del alimentador tiene características de tierra separada de cualquier otra, incluso de la tierra de masa del mismo aparato.\nNo interpretes «tierra» como permiso para unirla a cualquier conductor o electrodo próximo. El diseño debe cumplir las condiciones específicas del alimentador y la instalación.\nIdea clave: Avisar y mantener la tierra separada son requisitos específicos de la cerca.\nComprobación: No. BT-39 exige características de tierra separada incluso respecto de ella.\nConfusión frecuente: La tierra del alimentador debe ser separada. No utilices los apoyos de otra canalización.",
          "references": [
            {
              "label": "ITC-BT-39 · §§1, 2 y 3",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-39"
            }
          ]
        }
      ]
    },
    {
      "id": "bt40",
      "title": "Instalaciones generadoras",
      "cards": [
        {
          "id": "gen-tipos",
          "title": "1. Aislada, asistida e interconectada",
          "text": "La clasificación depende de la conexión a la red\nAislada: no puede existir conexión eléctrica con la red de distribución.\nAsistida: la red y el generador no funcionan normalmente en paralelo; se utiliza la conmutación prevista.\nInterconectada: funciona normalmente en paralelo con la red.\nUna fotovoltaica sin excedentes puede estar interconectada: limita la exportación, pero sigue conectada eléctricamente a la red.\nLa existencia de una batería tampoco decide esta clasificación. Pregúntate cómo se conectan las fuentes y en qué modos pueden funcionar.\nIdea clave: El modo de conexión decide el tipo de generadora; exportar cero no significa estar aislada.\nComprobación: No. Puede ser interconectada sin excedentes: el antivertido limita la exportación, no elimina la conexión.\nConfusión frecuente: Cero vertido no es aislamiento eléctrico.",
          "references": [
            {
              "label": "ITC-BT-40 · §2",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-40"
            }
          ]
        },
        {
          "id": "transferencia",
          "title": "2. Conmutar fuentes sin crear un paralelo indebido",
          "text": "Enclavamiento y sincronización cumplen funciones distintas\nLa conmutación selecciona la fuente que alimenta la instalación. En una generadora asistida, el dispositivo previsto impide un acoplamiento simultáneo indebido de red y generador.\nEl enclavamiento impide combinaciones de maniobra no permitidas. La sincronización coordina las magnitudes necesarias para el acoplamiento previsto: no son lo mismo.\nBT-40 §4.2 contempla una transferencia sin corte con sincronización y un acoplamiento que no se mantiene más de 5 segundos, además de sus otras condiciones. No es un permiso general para dejar ambas fuentes en paralelo.\nNeutro, tierras y dispositivos de transferencia se resuelven por diseño; nunca se realimenta una vivienda conectando el generador a una toma.\nIdea clave: La transferencia debe controlar qué fuentes están conectadas y qué paralelo está permitido.\nComprobación: No. Pertenecen al supuesto específico de transferencia sin corte, con sincronización y las demás condiciones de BT-40.\nConfusión frecuente: Enclavamiento y sincronización no son lo mismo. Un puente improvisado no es transferencia segura.",
          "references": [
            {
              "label": "ITC-BT-40 · §4.2 y §8",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-40"
            }
          ]
        },
        {
          "id": "gen-cable",
          "title": "3. Dimensionar la conexión del generador",
          "text": "Capacidad ≥125 % de I máxima · caída ≤1,5 % a I nominal\nBT-40 §5 utiliza dos comprobaciones diferentes:\nCapacidad de corriente del cable: no inferior al 125 % de la intensidad máxima del generador.\nCaída de tensión: no superior al 1,5 % entre el generador y el punto de interconexión, calculada a su intensidad nominal.\nEjemplo: si la intensidad máxima es 20 A, la capacidad requerida por el primer criterio es al menos 25 A. Después hay que comprobar la sección con las condiciones de instalación, protección y caída.\nEn FV se distinguen los tramos CC y CA. Este porcentaje no sustituye las condiciones específicas del cableado de cadenas ni los límites de módulos e inversor.\nIdea clave: No confundas la corriente usada para capacidad térmica con la usada para el límite literal de caída.\nComprobación: 25 A. Después siguen siendo necesarias las demás comprobaciones del cable.\nConfusión frecuente: La corriente de capacidad y la usada para el límite literal de caída no se confunden.",
          "references": [
            {
              "label": "ITC-BT-40 · §5",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-40"
            }
          ]
        },
        {
          "id": "antiisla",
          "title": "4. Antiisla, antivertido y salida de respaldo",
          "text": "Tres funciones que no se sustituyen\nAntiisla y protección de interfaz: evitan alimentar una red exterior desenergizada y actúan ante las condiciones de red previstas.\nAntivertido: limita la exportación mientras la instalación trabaja conectada.\nRespaldo o backup: alimenta las cargas previstas durante un corte con la separación de la red exterior que exige el diseño.\nLos ajustes reales se determinan con la normativa de conexión, la certificación y la documentación del equipo. No uses cifras de un cuestionario antiguo como configuración universal.\nUn inversor con respaldo no puede mantener energizada la red pública durante un corte.\nIdea clave: Cero exportación, desconexión de red y respaldo son funciones distintas.\nComprobación: No. Antivertido limita exportación conectado; antiisla evita mantener energizada una red exterior desenergizada.\nConfusión frecuente: Tener «backup» no autoriza mantener energizada la red pública durante un corte.",
          "references": [
            {
              "label": "ITC-BT-40 · §7 y anexo I",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-40"
            },
            {
              "label": "RD 244/2019 · art. 5",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2019-5089"
            }
          ]
        },
        {
          "id": "gen-tierras",
          "title": "5. Tierra y neutro en cada modo de funcionamiento",
          "text": "Analiza red y reserva por separado\nLa eficacia de la protección depende del esquema y de cómo se conecta el generador. BT-40 §8 distingue instalaciones aisladas, asistidas e interconectadas.\nSi existe modo de reserva, estudia también ese esquema: qué fuente lo alimenta, cómo se establece la referencia del neutro y qué dispositivo asegura la protección en ese modo.\nNo se hace un puente N-PE arbitrario en una instalación TT por añadir una batería. Una unión incorrecta puede alterar los diferenciales o producir corrientes peligrosas.\nLa continuidad del PE no se elimina al conmutar; las tierras no deben transferir defectos ni crear situaciones peligrosas entre instalaciones.\nIdea clave: La protección debe ser eficaz tanto conectado a red como en el modo de reserva previsto.\nComprobación: No. La conexión de neutro y tierra debe estar prevista por el diseño y las reglas aplicables en cada modo.\nConfusión frecuente: Un puente N-PE arbitrario puede alterar los diferenciales o crear corrientes peligrosas.",
          "references": [
            {
              "label": "ITC-BT-40 · §8",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-40"
            },
            {
              "label": "ITC-BT-24 · §4.1",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-24"
            }
          ]
        },
        {
          "id": "umbrales-fv",
          "title": "6. Tres umbrales de potencia que suelen confundirse",
          "text": "Especialista ≥10 kW · proyecto >10 kW · compensación ≤100 kW\nCada cifra responde a una pregunta distinta:\nCompetencia de generadoras: modalidad especialista desde 10 kW, incluida la igualdad.\nProyecto por el supuesto de generador o convertidor: más de 10 kW. Otros usos pueden exigirlo también.\nCompensación simplificada: potencia no superior a 100 kW, junto a los demás requisitos.\nCon 10 kW exactos no respondas igual a las dos primeras preguntas: ≥10 y >10 son condiciones distintas.\nAdemás, identifica qué potencia define la norma. Para FV, RD 244/2019 usa la potencia máxima del inversor o suma de máximas de inversores, no automáticamente los kWp de módulos.\nIdea clave: Relaciona umbral, desigualdad y definición de potencia antes de elegir respuesta.\nComprobación: No. Se alcanza el especialista (≥10), pero no se supera el de proyecto por ese criterio (>10).\nConfusión frecuente: No aplicar indistintamente potencia pico de módulos a cualquier trámite.",
          "references": [
            {
              "label": "ITC-BT-03 · §3.2",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-3"
            },
            {
              "label": "ITC-BT-04 · §3.1.c",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-4"
            },
            {
              "label": "RD 244/2019 · arts. 3.h y 4.2.a",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2019-5089"
            }
          ]
        }
      ]
    },
    {
      "id": "bt41",
      "title": "Caravanas y parques de caravanas",
      "cards": [
        {
          "id": "v3-bt41-96",
          "title": "1. Caravana y parque: identificar qué se estudia",
          "text": "BT-41 remite a la norma particular\nBT-41 trata las instalaciones de caravanas y parques de caravanas. BT-42 corresponde a puertos y marinas; el uso recreativo parecido no hace equivalentes ambos ámbitos.\nEl texto de la ITC remite a UNE 20.460-7-708. Las referencias y ediciones aplicables se contrastan con el listado actualizado de BT-02, identificando el campo concreto de vehículo o parque.\nLos receptores deben cumplir además los requisitos de producto del artículo 6.\nPara estudiar un caso, señala primero qué parte analizas: conexión del parque, distribución o instalación del vehículo. Después busca la prescripción de ese ámbito.\nIdea clave: Identificar la parte de la instalación evita trasladar requisitos entre vehículo y parque.\nComprobación: No. BT-41 y BT-42 tienen ámbitos y prescripciones particulares distintos.\nConfusión frecuente: La ITC remite a una norma: no contiene por sí sola todos los valores de tomas, columnas y parcelas.",
          "references": [
            {
              "label": "ITC-BT-41 · §§1 y 2; ITC-BT-02; REBT · art. 6; reglas relacionadas BT-19, BT-24 y BT-30",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-41"
            }
          ]
        },
        {
          "id": "v3-bt41-97",
          "title": "2. Ambiente exterior, conexión y cable",
          "text": "La toma no se elige como si estuviera en un salón\nLa instalación exterior puede sufrir agua, golpes, movimiento y tracción. La selección de bases, envolventes y cables debe ser adecuada a esas condiciones y a la norma particular aplicable.\nEl cable se comprueba por su servicio previsto, ambiente, condiciones mecánicas y conexión, además de intensidad y protección. Que una clavija entre físicamente no demuestra que la conexión sea válida.\nDesenchufar voluntariamente no sustituye las medidas reglamentarias de protección contra choques de BT-24 y la norma particular.\nBT-02 ayuda a localizar la edición aplicable. Este resumen no inventa valores de parcelas, columnas o tomas que no desarrolla el literal de la ITC.\nIdea clave: La aptitud exterior y las condiciones de conexión se comprueban junto con la protección eléctrica.\nComprobación: No. Hay que comprobar tensión, servicio, ambiente, cable y medidas de protección aplicables.\nConfusión frecuente: La ITC remite a una norma: no contiene por sí sola todos los valores de tomas, columnas y parcelas.",
          "references": [
            {
              "label": "ITC-BT-41 · §§1 y 2; ITC-BT-02; REBT · art. 6; reglas relacionadas BT-19, BT-24 y BT-30",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-41"
            }
          ]
        },
        {
          "id": "v3-bt41-98",
          "title": "3. Funcionar no equivale a estar verificado",
          "text": "Encender un receptor es solo una comprobación\nUna prueba funcional confirma que el equipo responde, pero no demuestra por sí sola la continuidad protectora, aislamiento y demás condiciones de seguridad de la instalación.\nLa verificación se realiza conforme a BT-05 y las reglas generales y particulares que correspondan, con el método e instrumento adecuados.\nSi una pregunta exige una distancia, sección o disposición que la ITC no reproduce, consulta la norma particular aplicable y el material autorizado del curso. BT-41 es una remisión breve, no el texto íntegro de esa norma.\nIdea clave: Se deben comprobar las medidas de seguridad además de la respuesta funcional de los receptores.\nComprobación: No. El funcionamiento no sustituye la comprobación reglamentaria de continuidad protectora.\nConfusión frecuente: La ITC remite a una norma: no contiene por sí sola todos los valores de tomas, columnas y parcelas.",
          "references": [
            {
              "label": "ITC-BT-41 · §§1 y 2; ITC-BT-02; REBT · art. 6; reglas relacionadas BT-19, BT-24 y BT-30",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-41"
            }
          ]
        }
      ]
    },
    {
      "id": "bt42",
      "title": "Puertos y marinas",
      "cards": [
        {
          "id": "v3-bt42-99",
          "title": "1. Qué instalación regula BT-42",
          "text": "Alimentación desde puertos y marinas a barcos de recreo\nBT-42 regula la instalación de puertos y marinas para alimentar barcos de recreo. No es un manual de toda instalación eléctrica situada dentro de cualquier barco.\nLa tensión general no supera 230 V CA monofásica. El texto permite 400 V CA trifásica para barcos o yates de gran consumo en su supuesto específico.\nSi se utiliza MBTS, la protección contra contacto directo se asegura cualquiera que sea su tensión asignada mediante aislamiento capaz de soportar el ensayo indicado de 500 V durante un minuto.\nTensión de suministro y tensión del ensayo son magnitudes con funciones distintas.\nIdea clave: Primero delimita la instalación desde tierra y después aplica su regla de alimentación.\nComprobación: No. Son la condición de ensayo del aislamiento protector, no la tensión de suministro.\nConfusión frecuente: En TN solo se admite TN-S. Ni obstáculos ni puesta fuera del alcance son medidas aceptadas por esta ITC.",
          "references": [
            {
              "label": "ITC-BT-42 · §§1, 2, 3 y 4",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-42"
            }
          ]
        },
        {
          "id": "v3-bt42-100",
          "title": "2. Esquema y medidas protectoras admitidas",
          "text": "En TN, solo TN-S\nCuando se utiliza esquema TN, BT-42 admite TN-S: neutro y conductor de protección separados. No se traslada una configuración con PEN combinado.\nLa protección prevista utiliza dispositivos de corte diferencial-residual con las condiciones del conjunto y las bases. Se mantiene además la coordinación general necesaria.\nLa ITC no admite obstáculos ni puesta fuera del alcance como medidas de protección contra contactos directos.\nEn MBTS, el ensayo de aislamiento indicado es 500 V durante un minuto. Una tensión reducida no permite omitir la protección exigida para ese ambiente.\nIdea clave: El entorno de la marina restringe los esquemas y las medidas de protección que se pueden usar.\nComprobación: No. En TN, BT-42 solo admite la variante TN-S.\nConfusión frecuente: En TN solo se admite TN-S. Ni obstáculos ni puesta fuera del alcance son medidas aceptadas por esta ITC.",
          "references": [
            {
              "label": "ITC-BT-42 · §§1, 2, 3 y 4",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-42"
            }
          ]
        },
        {
          "id": "v3-bt42-101",
          "title": "3. Envolventes y canalizaciones junto al agua",
          "text": "IPX6 en el supuesto indicado · sin líneas aéreas para la alimentación\nLos equipos y armarios del apartado deben cumplir la protección prescrita IPX6, o estar instalados en un armario con ese grado y apertura mediante herramientas o útiles específicos, según el supuesto.\nBT-42 no permite líneas aéreas para la alimentación contemplada. Las canalizaciones deben adecuarse al agua, al movimiento y a las condiciones mecánicas previsibles.\nAl estudiar el esquema, localiza la distribución desde tierra, las bases y el recorrido de los cables. No presupongas que un cable válido en un lugar seco sigue siendo apto si puede moverse o entrar en contacto con el agua.\nIdea clave: El trazado y la envolvente se eligen para las condiciones reales del puerto o marina.\nComprobación: No. BT-42 prohíbe utilizar líneas aéreas para la alimentación contemplada.\nConfusión frecuente: En TN solo se admite TN-S. Ni obstáculos ni puesta fuera del alcance son medidas aceptadas por esta ITC.",
          "references": [
            {
              "label": "ITC-BT-42 · §§1, 2, 3 y 4",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-42"
            }
          ]
        }
      ]
    },
    {
      "id": "bt43",
      "title": "Receptores: prescripciones generales",
      "cards": [
        {
          "id": "receptores",
          "title": "1. El mapa de las ITC de receptores",
          "text": "BT-43 es la base; BT-44 a BT-48 desarrollan usos\nUsa este mapa para encontrar la regla:\nBT-43: conexión, clase, alimentación y condiciones generales.\nBT-44: alumbrado.\nBT-45: aparatos de caldeo.\nBT-46: cables y folios radiantes.\nBT-47: motores y herramientas portátiles de su ámbito.\nBT-48: transformadores, reactancias, rectificadores y condensadores.\nConsulta también al fabricante: define las condiciones de su equipo. Un rectificador convierte CA a CC, pero no garantiza separación galvánica. Un condensador puede conservar energía después de desconectar.\nIdea clave: Encuentra la ITC del receptor y combínala con sus condiciones de producto y emplazamiento.\nComprobación: No. Convertir CA a CC y proporcionar separación galvánica son funciones distintas.\nConfusión frecuente: Desconectado no equivale siempre a descargado. Clase de aislamiento y grado IP no se intercambian.",
          "references": [
            {
              "label": "ITC-BT-43",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-43"
            },
            {
              "label": "ITC-BT-44",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-44"
            },
            {
              "label": "ITC-BT-45",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-45"
            },
            {
              "label": "ITC-BT-46",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-46"
            },
            {
              "label": "ITC-BT-47",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-47"
            },
            {
              "label": "ITC-BT-48",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-48"
            }
          ]
        },
        {
          "id": "v3-bt43-102",
          "title": "2. Clases I, II y III de protección",
          "text": "Clase de receptor no es código IP\nClase I: aislamiento principal y conexión protectora de las masas conforme al diseño.\nClase II: doble aislamiento o aislamiento reforzado; su protección no depende de la puesta a tierra de la masa como en clase I.\nClase III: protección ligada a la alimentación MBTS y las condiciones constructivas correspondientes.\nEsta clasificación no es el IP ni una categoría de sobretensión.\nComprueba además la tensión o gama asignada del receptor. Un aparato debe utilizarse en su rango previsto; que el conector encaje no prueba compatibilidad de tensión ni clase.\nIdea clave: La clase explica la medida de protección del aparato; el IP y la tensión responden a otras preguntas.\nComprobación: No. Clase II se refiere al doble aislamiento o aislamiento reforzado del receptor.\nConfusión frecuente: Clase II no es categoría de sobretensión II. Un nudo en el cable no es un dispositivo antitracción.",
          "references": [
            {
              "label": "ITC-BT-43 · §§2.2, 2.3, 2.4, 2.5 y 2.6; ITC-BT-24",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-43"
            }
          ]
        },
        {
          "id": "v3-bt43-103",
          "title": "3. Conexión sin tracción y cable apto para el calor",
          "text": "Un nudo no sustituye al dispositivo antitracción\nSi hay selector de tensión, debe impedirse su modificación accidental. La posición elegida tiene que corresponder a la alimentación.\nEn la entrada al aparato, dispositivos apropiados protegen el cable frente a tracción, torsión, abrasión y otros esfuerzos. No se admite anudarlo o atarlo al receptor como solución.\nEl PE se deja con longitud suficiente para que, si falla la retención, soporte la tracción después de los conductores de alimentación.\nSi las partes del receptor que pueden tocar el cable superan 85 °C, su aislamiento y cubierta no serán de material termoplástico, conforme al supuesto de BT-43.\nIdea clave: La conexión debe conservar su protección eléctrica incluso ante el fallo mecánico previsto.\nComprobación: Para que, si falla la retención del cable, la tracción llegue al PE después de afectar a los conductores de alimentación.\nConfusión frecuente: Clase II no es categoría de sobretensión II. Un nudo en el cable no es un dispositivo antitracción.",
          "references": [
            {
              "label": "ITC-BT-43 · §§2.2, 2.3, 2.4, 2.5 y 2.6; ITC-BT-24",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-43"
            }
          ]
        }
      ]
    },
    {
      "id": "bt44",
      "title": "Receptores de alumbrado",
      "cards": [
        {
          "id": "descarga",
          "title": "1. Qué calcula el factor 1,8 de descarga",
          "text": "W de lámparas ×1,8 → VA mínimos de carga de línea\nBT-44 §3.1 establece para receptores con lámparas de descarga una carga mínima prevista en VA de 1,8 veces la potencia en W de las lámparas. La alimentación considera también sus elementos asociados, armónicos y corrientes de arranque.\nEjemplo: 900 W ×1,8 = 1.620 VA. Este resultado sirve para el criterio de carga de línea; no significa afirmar que las lámparas consumen 1.620 W activos.\nSe admite el cálculo específico del apartado cuando se conocen las cargas y arranques y se cumple su condición de factor de potencia.\nNo traslades automáticamente el factor a cualquier LED ni a toda la potencia activa de un edificio.\nIdea clave: El factor convencional produce VA de carga de línea, no W activos universales.\nComprobación: No. Son 1.620 VA en la regla convencional de carga de línea de descarga.\nConfusión frecuente: 900 W de lámparas ×1,8 son 1.620 VA para esa regla, no una afirmación de 1.620 W activos.",
          "references": [
            {
              "label": "ITC-BT-44 · §3.1",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-44"
            },
            {
              "label": "ITC-BT-09 · §3",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-9"
            }
          ]
        },
        {
          "id": "v3-bt44-104",
          "title": "2. Carga de línea y factor de potencia",
          "text": "Descarga: factor de potencia mínimo 0,9\nLa potencia activa P se mide en W; la aparente S, en VA. La relación depende del factor de potencia y de las condiciones de la carga.\nEn lámparas de descarga, BT-44 exige compensación hasta un factor de potencia mínimo de 0,9 y regula la compensación de grupos de carga variable. Para sustituir el factor convencional de sección se cumplen todas las condiciones de §3.1.\nEn las hojas de previsión de este curso se conserva el valor de potencia dado si el ejercicio no pide otro tratamiento, según la pauta de corrección comunicada por CEG. Esa pauta académica no sustituye el dimensionado reglamentario de la línea.\nIdea clave: Identifica si el ejercicio pregunta potencia activa de previsión o carga de alimentación de descarga.\nComprobación: No. Es una pauta de esos ejercicios; el dimensionado de la línea mantiene sus criterios específicos.\nConfusión frecuente: El factor 1,8 da una previsión mínima de carga de línea en VA: no convierte toda la previsión activa del edificio en P×1,8.",
          "references": [
            {
              "label": "ITC-BT-44 · §§3, 4 y 5; ITC-BT-10; criterio CEG para previsión",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-44"
            }
          ]
        },
        {
          "id": "v3-bt44-105",
          "title": "3. Condensadores y alumbrado portátil",
          "text": "Desconectar no demuestra descarga inmediata\nLos condensadores de compensación de los equipos auxiliares de descarga deben disponer de la resistencia prevista para que su tensión no supere 50 V después de 60 s desde la desconexión. No se presume que quedan descargados al abrir el interruptor.\nEn caldererías, grandes depósitos metálicos, cascos navales y lugares análogos, el alumbrado portátil se alimenta con tensión de seguridad no superior a 24 V, salvo la excepción de transformador de separación del apartado.\nPara LED se utilizan sus características reales y el criterio aplicable. La etiqueta «alumbrado» no basta para trasladar el factor 1,8 de descarga.\nIdea clave: Tensión residual, tensión de uso y tecnología de lámpara tienen criterios distintos.\nComprobación: No. Son una condición de descarga de condensadores; el supuesto de alumbrado portátil tiene su propia regla de 24 V y excepción.\nConfusión frecuente: El factor 1,8 da una previsión mínima de carga de línea en VA: no convierte toda la previsión activa del edificio en P×1,8.",
          "references": [
            {
              "label": "ITC-BT-44 · §§3, 4 y 5; ITC-BT-10; criterio CEG para previsión",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-44"
            }
          ]
        },
        {
          "id": "v3-bt44-106",
          "title": "4. Rótulos luminosos: entrada y salida no son iguales",
          "text": "Leer la tensión de salida y el conjunto completo\nUn rótulo puede recibir baja tensión en su entrada y trabajar con una tensión mayor en el equipo de alimentación de sus tubos. No deduzcas todo su riesgo solo de la tensión de entrada.\nBT-44 remite a la norma particular de rótulos y tubos luminosos con salida en vacío entre 1 y 10 kV. El conjunto tiene condiciones específicas de envolvente, acceso y corte.\nRevisa también el alcance profesional correspondiente en BT-03. Comprender el funcionamiento del rótulo no acredita automáticamente la modalidad especialista requerida para su instalación.\nIdea clave: La tensión de entrada no describe por sí sola las partes internas de un rótulo.\nComprobación: No. El equipo puede generar una tensión de salida mayor y requiere las condiciones particulares aplicables.\nConfusión frecuente: El factor 1,8 da una previsión mínima de carga de línea en VA: no convierte toda la previsión activa del edificio en P×1,8.",
          "references": [
            {
              "label": "ITC-BT-44 · §§3, 4 y 5; ITC-BT-10; criterio CEG para previsión",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-44"
            }
          ]
        }
      ]
    },
    {
      "id": "bt45",
      "title": "Aparatos de caldeo",
      "cards": [
        {
          "id": "v3-bt45-107",
          "title": "1. Caldeo: qué se admite y dónde se instala",
          "text": "El calor normal también puede causar un incendio\nBT-45 regula aparatos que transforman energía eléctrica en calor y distingue los usos domésticos, comerciales e industriales.\nEn uso doméstico están prohibidos los calentadores con elementos desnudos sumergidos en agua y los que utilizan el agua como parte del circuito eléctrico. Una condición industrial no se traslada a vivienda.\nLos calentadores de locales no se instalan en nichos o cajas construidos o revestidos de materiales combustibles.\nRespeta las distancias e instrucciones del fabricante. Las cifras que ofrece la ITC en ausencia de instrucciones no permiten ignorar una condición de montaje más exigente indicada para el equipo.\nIdea clave: Además de protección eléctrica, hay que evitar temperaturas peligrosas en materiales cercanos.\nComprobación: No. Ese tipo de solución está prohibido para uso doméstico.\nConfusión frecuente: 8 cm sin instrucciones y 50 cm frente a una abertura incandescente son supuestos distintos.",
          "references": [
            {
              "label": "ITC-BT-45 · §§1, 2.1, 2.2, 2.3, 3 y 3.1; ITC-BT-43",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-45"
            }
          ]
        },
        {
          "id": "v3-bt45-108",
          "title": "2. Distancias y funciones de los dispositivos",
          "text": "8 cm y 50 cm corresponden a supuestos distintos\nEn ausencia de instrucciones del fabricante para calentadores de locales, BT-45 indica:\n8 cm: distancia mínima a las superficies u objetos combustibles del supuesto general.\n50 cm: entre aberturas o rejillas con elementos calefactores luminosos detrás y los elementos combustibles.\nPara cocinas, hornos y equipos del apartado se requiere el medio de conexión y corte omnipolar o equivalente admitido.\nEn los aparatos industriales afectados, el limitador térmico reduce o interrumpe el calentamiento antes de alcanzar una temperatura peligrosa, incluso en las anomalías previstas. Un termostato de uso normal y la posibilidad de desconectar no son la misma función.\nIdea clave: Identifica el tipo de aparato y abertura antes de escoger la distancia.\nComprobación: No. Ese supuesto exige al menos 50 cm entre la abertura y los elementos combustibles.\nConfusión frecuente: 8 cm sin instrucciones y 50 cm frente a una abertura incandescente son supuestos distintos.",
          "references": [
            {
              "label": "ITC-BT-45 · §§1, 2.1, 2.2, 2.3, 3 y 3.1; ITC-BT-43",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-45"
            }
          ]
        },
        {
          "id": "v3-bt45-109",
          "title": "3. Uso industrial y cable de alimentación",
          "text": "Las condiciones industriales no son excepciones domésticas\nLos calentadores donde el agua forma parte del circuito y los de elementos desnudos sumergidos solo se tratan en los usos y condiciones industriales especializados previstos. No son una autorización general para cualquier usuario o local.\nEl cable de alimentación también debe soportar el entorno térmico. Comprueba aislamiento y cubierta, temperatura prevista, recorrido y documentación del receptor.\nRelaciona BT-45 con BT-43: si las partes capaces de tocar el cable superan 85 °C, no se utiliza material termoplástico en su aislamiento y cubierta en el supuesto indicado.\nIdea clave: El uso admitido y la aptitud térmica del cable se verifican por separado.\nComprobación: No. Hay que comprobar también la aptitud térmica del aislamiento y cubierta y las condiciones de montaje.\nConfusión frecuente: 8 cm sin instrucciones y 50 cm frente a una abertura incandescente son supuestos distintos.",
          "references": [
            {
              "label": "ITC-BT-45 · §§1, 2.1, 2.2, 2.3, 3 y 3.1; ITC-BT-43",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-45"
            }
          ]
        }
      ]
    },
    {
      "id": "bt46",
      "title": "Cables y folios radiantes",
      "cards": [
        {
          "id": "v3-bt46-110",
          "title": "1. Circuitos y protección del sistema radiante",
          "text": "Máximo 25 A por fase y circuito · diferencial 30 mA\nBT-46 comprende los cables y folios radiantes de su ámbito, empotrados en suelos, forjados y techos, a tensiones nominales 300/500 V. No se aplica indistintamente a cualquier suelo caliente.\nLa subdivisión considera BT-25, simultaneidad, distancia y seguridad, con un máximo de 25 A por fase y circuito. Cada circuito lleva automático de corte omnipolar y diferencial de alta sensibilidad 30 mA.\nEl termostato de control puede no ser omnipolar según el apartado. Esa excepción del control no elimina los dispositivos de corte omnipolar exigidos para la instalación.\nIdea clave: El termostato regula temperatura; las protecciones y el corte general tienen otras funciones.\nComprobación: No. La excepción del termostato no sustituye la protección y el corte omnipolar exigidos.\nConfusión frecuente: Antes de cubrir se comprueba continuidad; después, antes del pavimento, aislamiento. El termostato no sustituye el corte omnipolar general.",
          "references": [
            {
              "label": "ITC-BT-46 · §§1, 2, 3.1, 3.2, 3.2.1, 3.4, 4.1 y 6",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-46"
            }
          ]
        },
        {
          "id": "v3-bt46-111",
          "title": "2. Comprobaciones antes y después de cubrir",
          "text": "Antes: continuidad · después: aislamiento\nEl orden de las comprobaciones importa porque el cable quedará oculto:\nAntes de cubrir: comprobar continuidad del circuito.\nUna vez cubierto y antes del pavimento: comprobar aislamiento respecto a tierra, al menos 250.000 Ω, es decir, 0,25 MΩ, en el supuesto de esta ITC.\nLas uniones con los tramos fríos deben venir realizadas de fábrica, salvo la excepción de avería prevista. No se fabrican ordinariamente en obra.\nEn el supuesto de conexión de armadura al PE, el conductor tiene la sección de la fase según la regla particular del apartado.\nIdea clave: Las pruebas en cada fase de ejecución detectan daños antes de que el sistema quede inaccesible.\nComprobación: A 0,25 MΩ: un megaohmio equivale a un millón de ohmios.\nConfusión frecuente: Antes de cubrir se comprueba continuidad; después, antes del pavimento, aislamiento. El termostato no sustituye el corte omnipolar general.",
          "references": [
            {
              "label": "ITC-BT-46 · §§1, 2, 3.1, 3.2, 3.2.1, 3.4, 4.1 y 6",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-46"
            }
          ]
        },
        {
          "id": "v3-bt46-112",
          "title": "3. Curvatura, calor y fraguado",
          "text": "Radio mínimo: 6D sin armadura · 10D con armadura\nEl radio de curvatura mínimo del cable radiante es 6 veces su diámetro exterior sin armadura y 10 veces con armadura. D es un diámetro en mm, no la sección del cobre en mm².\nEjemplo: con D = 5 mm y sin armadura, el radio mínimo resulta 30 mm. Se siguen además las condiciones del producto y del montaje.\nEl cable de calefacción no debe transmitir calor indebido a los cables de fuerza y alumbrado próximos; si afecta a su temperatura, se considera en su dimensionado.\nEl texto no permite utilizarlo para acelerar el fraguado; distingue ese proceso del secado que sí contempla.\nIdea clave: El radio se calcula con el diámetro exterior y el calor debe considerarse también en los cables vecinos.\nComprobación: 30 mm: 6 × 5. Es radio de curvatura, no diámetro ni sección del conductor.\nConfusión frecuente: Antes de cubrir se comprueba continuidad; después, antes del pavimento, aislamiento. El termostato no sustituye el corte omnipolar general.",
          "references": [
            {
              "label": "ITC-BT-46 · §§1, 2, 3.1, 3.2, 3.2.1, 3.4, 4.1 y 6",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-46"
            }
          ]
        }
      ]
    },
    {
      "id": "bt47",
      "title": "Motores",
      "cards": [
        {
          "id": "motor-unico",
          "title": "1. Conductor de un motor",
          "text": "Capacidad de corriente ≥1,25 × I a plena carga\nPara un motor, BT-47 §3.1 dimensiona el conductor para el 125 % de su intensidad a plena carga. Es multiplicar por 1,25, no añadir un 125 %.\nEjemplo: motor de 16 A → capacidad por este criterio de al menos 20 A. La sección final se elige con temperatura, método de instalación, agrupamiento, caída y protección.\nSi el enunciado da potencia útil, obtén primero la absorbida: P absorbida = P útil/η. Después calcula la corriente con la fórmula monofásica o trifásica que corresponda.\nEste factor del conductor no ordena por sí solo elegir un automático de 1,25 × I.\nIdea clave: El 125 % es un criterio de capacidad del conductor; la protección requiere su propia coordinación.\nComprobación: 20 A: 16 ×1,25. Eso no decide por sí solo la sección final ni el calibre del automático.\nConfusión frecuente: 125 % significa multiplicar por 1,25, no añadir un 125 % encima.",
          "references": [
            {
              "label": "ITC-BT-47 · §3.1 y §4",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-47"
            }
          ]
        },
        {
          "id": "motores-varios",
          "title": "2. Una línea que alimenta varios motores",
          "text": "125 % del mayor + 100 % de los demás\nBT-47 §3.2 utiliza la intensidad a plena carga del motor de mayor potencia al 125 % y suma la intensidad completa de todos los demás.\nEjemplo: el mayor tiene 20 A y los otros 10 A y 8 A. Capacidad mínima por ese criterio: 1,25 ×20 +10 +8 = 43 A.\nNo se multiplica automáticamente por 1,25 toda la suma. Si hay otros receptores, se incorpora además la carga combinada conforme a §3.3.\nLa hoja académica de previsión CEG puede aplicar su pauta a potencias dadas: identifica si preguntas el conductor reglamentario o ese ejercicio de previsión.\nIdea clave: En varios motores el recargo se aplica al motor de mayor potencia, no a todos indistintamente.\nComprobación: 43 A: 1,25 ×20 +10 +8, antes de las demás comprobaciones.\nConfusión frecuente: No multipliques automáticamente por 1,25 toda la suma cuando se pregunta literalmente por varios motores.",
          "references": [
            {
              "label": "ITC-BT-47 · §3.2–3.3",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-47"
            }
          ]
        },
        {
          "id": "arranque",
          "title": "3. Arranque de motores y coeficiente de elevación",
          "text": "El 1,3 tiene un contexto reglamentario concreto\nDurante el arranque, el motor puede absorber una corriente superior a la de régimen. BT-47 §6 regula la relación entre ambas, con condiciones y una tabla distinta para CA y CC.\nConsulta la tabla cuando el ejercicio pregunte un rango de potencia; no extrapoles una relación de un rango a otro, especialmente en las fronteras.\nPara motores de ascensores, grúas y elevación, la intensidad normal considerada a efectos de esas relaciones se obtiene de la necesaria para elevar la carga normal a velocidad de régimen, multiplicada por 1,3.\nTrasladar ese 1,3 a una potencia de previsión es una pauta académica CEG del curso, no una obligación universal de BT-10.\nIdea clave: Relaciona cada coeficiente con la magnitud y el apartado que lo utiliza.\nComprobación: No. Su regla del 1,3 tiene el contexto indicado de la intensidad normal de equipos de elevación para las relaciones de arranque.\nConfusión frecuente: No atribuir a BT-10 una obligación universal de multiplicar por 1,3 la potencia del edificio.",
          "references": [
            {
              "label": "ITC-BT-47 · §6",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-47"
            },
            {
              "label": "Criterio CEG comunicado en el briefing del alumno, 28/09/2026",
              "url": "#fuentes"
            }
          ]
        },
        {
          "id": "motor-prot",
          "title": "4. Proteger el motor y evitar un arranque peligroso",
          "text": "Maniobrar no equivale a proteger\nEl motor necesita protección contra cortocircuito y sobrecarga en sus fases. En trifásicos, la protección de sobrecarga debe cubrir el riesgo de falta de tensión en una fase según BT-47.\nSi al volver la tensión puede arrancar espontáneamente y causar un accidente o daño, se exige la protección correspondiente frente a falta de tensión.\nUn contactor realiza maniobras. Un relé térmico puede detectar sobrecarga, pero no constituye por sí solo toda la protección contra cortocircuitos.\nProtecciones, método de arranque y condiciones de servicio se coordinan con los datos e instrucciones del motor.\nIdea clave: El conjunto debe resolver cortocircuito, sobrecarga y rearranque peligroso; un solo elemento no cubre todo.\nComprobación: No. Es un elemento de maniobra; las protecciones contra sobrecarga, corto y los otros riesgos deben estar resueltas.\nConfusión frecuente: Un relé térmico no es toda la protección contra cortocircuitos; un contactor no protege de todo.",
          "references": [
            {
              "label": "ITC-BT-47 · §4–5",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-47"
            }
          ]
        },
        {
          "id": "v3-bt47-113",
          "title": "5. Herramientas en lugares muy conductores",
          "text": "En el supuesto de mano: clase III\nBT-47 distingue las herramientas profesionales en obras o exterior de las utilizadas en emplazamientos muy conductores, como trabajos de hormigonado o el interior de calderas y tuberías metálicas.\nPara las herramientas portátiles a mano en estos últimos supuestos exige clase III. Una herramienta admisible en un taller seco no queda automáticamente admitida dentro de una caldera metálica.\nLa clase del aparato y su alimentación se comprueban junto con las condiciones del lugar. No sustituyas el requisito por «lleva diferencial» sin revisar la medida concreta.\nIdea clave: El emplazamiento puede restringir la clase de herramienta admitida.\nComprobación: No. Para el supuesto muy conductor de herramientas portátiles a mano, BT-47 exige clase III.\nConfusión frecuente: Una herramienta válida en un taller seco no es automáticamente válida dentro de una caldera metálica.",
          "references": [
            {
              "label": "ITC-BT-47 · §8",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-47"
            }
          ]
        }
      ]
    },
    {
      "id": "bt48",
      "title": "Transformadores, reactancias y condensadores",
      "cards": [
        {
          "id": "v3-bt48-114",
          "title": "1. Equipos, refrigeración y autotransformador",
          "text": "Cambiar tensión no siempre separa circuitos\nBT-48 incluye transformadores, autotransformadores, reactancias, rectificadores y condensadores. Su instalación debe cumplir las condiciones del producto y del emplazamiento.\nSe necesita ventilación suficiente para refrigerarlos y elementos de conexión compatibles con sus materiales; el texto cita piezas bimetálicas para bobinados de aluminio.\nUn autotransformador tiene un devanado común y no proporciona separación protectora por el hecho de reducir tensión. Los dos circuitos conectados deben tener aislamiento previsto para la tensión mayor.\nEjemplo conceptual: una salida de menor tensión no autoriza a reducir el aislamiento si está eléctricamente unida mediante el devanado común.\nIdea clave: El aislamiento y la refrigeración se comprueban además de la potencia del equipo.\nComprobación: No. Ambos circuitos deben prever aislamiento para la tensión mayor conforme al apartado.\nConfusión frecuente: 1,3·In del condensador y 1,5–1,8·In para su aparamenta son criterios diferentes.",
          "references": [
            {
              "label": "ITC-BT-48 · §§2, 2.1, 2.2, 2.3 y 3",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-48"
            }
          ]
        },
        {
          "id": "v3-bt48-115",
          "title": "2. Protección del transformador y energía residual",
          "text": "Condensador desconectado puede conservar carga\nTodo transformador debe tener corte por sobreintensidad o sistema equivalente, coordinado con su placa y utilización.\nSi la carga residual de un condensador puede poner en peligro a personas, BT-48 prevé descarga automática o inscripción de aviso. Un aviso no demuestra que esté descargado: una actuación real requiere el procedimiento adecuado.\nDos condiciones ambientales que conviene recordar:\nSin indicación de temperatura máxima, no utilizar condensadores a 50 °C o más de ambiente.\nPor encima de 2.000 m de altitud, tomar las precauciones del fabricante.\nNo inventes una corrección universal de altitud si el equipo requiere una condición concreta.\nIdea clave: La desconexión y las condiciones de temperatura o altitud deben verificarse por separado.\nComprobación: No. El límite del apartado excluye temperatura ambiente de 50 °C o mayor.\nConfusión frecuente: 1,3·In del condensador y 1,5–1,8·In para su aparamenta son criterios diferentes.",
          "references": [
            {
              "label": "ITC-BT-48 · §§2, 2.1, 2.2, 2.3 y 3",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-48"
            }
          ]
        },
        {
          "id": "v3-bt48-116",
          "title": "3. Corriente del condensador y de su aparamenta",
          "text": "1,3·In y 1,5–1,8·In responden a requisitos distintos\nBT-48 indica protección adecuada del condensador cuando se utiliza con sobreintensidades superiores a 1,3 veces la intensidad de referencia del apartado, excluidos los transitorios.\nSus aparatos de mando y protección deben soportar permanentemente entre 1,5 y 1,8 veces la intensidad nominal del condensador, considerando armónicos y tolerancias de capacidad.\nEjemplo: para un condensador de In = 10 A, el segundo criterio supone entre 15 y 18 A de capacidad permanente de la aparamenta según la selección aplicable.\nNo son factores para multiplicar toda la potencia activa del edificio.\nIdea clave: Lee qué elemento y régimen de corriente pregunta antes de aplicar el coeficiente.\nComprobación: A los aparatos de mando y protección del condensador en régimen permanente.\nConfusión frecuente: 1,3·In del condensador y 1,5–1,8·In para su aparamenta son criterios diferentes.",
          "references": [
            {
              "label": "ITC-BT-48 · §§2, 2.1, 2.2, 2.3 y 3",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-48"
            }
          ]
        }
      ]
    },
    {
      "id": "bt49",
      "title": "Instalaciones eléctricas en muebles",
      "cards": [
        {
          "id": "v3-bt49-117",
          "title": "1. Sección mínima si el mueble no tiene tomas",
          "text": "0,75 mm² solo si se cumplen todas las condiciones\nBT-49 abarca muebles de diversas clases y también elementos de baño. Un mueble comercializado con equipo eléctrico montado se considera un receptor, con sus requisitos de producto.\nEn los muebles del apartado no destinado a baño, 0,75 mm² de cobre solo se admite si concurren todas estas condiciones:\nInstalación exclusivamente de alumbrado.\nConductores flexibles.\nLongitud hasta el aparato más alejado no superior a 10 m desde la conexión fija.\nNinguna base de toma de corriente.\nEn los demás casos sin bases, el mínimo del apartado es 1,5 mm². El dimensionado puede exigir una sección mayor.\nIdea clave: El mínimo de 0,75 mm² es condicionado, no universal para muebles.\nComprobación: No. La ausencia de bases es una condición indispensable de ese mínimo.\nConfusión frecuente: 0,75 mm² no es el mínimo universal de un mueble. Con bases de toma de corriente, el mínimo de este apartado es 2,5 mm².",
          "references": [
            {
              "label": "ITC-BT-49 · §§1, 2.1 a 2.5 y 3",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-49"
            }
          ]
        },
        {
          "id": "v3-bt49-118",
          "title": "2. Con tomas, movimiento y calor",
          "text": "Con bases: mínimo 2,5 mm² en el apartado\nSi el mueble del apartado incluye una base de toma de corriente, el mínimo es 2,5 mm² de cobre, sin perjuicio de la sección mayor que resulte del cálculo.\nLos cables se fijan y protegen frente a daños, tracción y torsión con los dispositivos apropiados. Las conexiones se disponen en cajas con al menos IP3X y tapa que requiere llave o útil, protegidas también frente a daños mecánicos.\nSi un equipo puede crear temperatura excesiva en un espacio cerrado, el supuesto exige un interruptor por cierre de puerta que lo deje fuera de servicio. No es una regla idéntica para cualquier cajón.\nIdea clave: La presencia de una toma cambia el mínimo; movimiento y calor añaden sus propias medidas.\nComprobación: No. El apartado exige que la tapa se abra con llave o útil, además del grado y la protección mecánica.\nConfusión frecuente: 0,75 mm² no es el mínimo universal de un mueble. Con bases de toma de corriente, el mínimo de este apartado es 2,5 mm².",
          "references": [
            {
              "label": "ITC-BT-49 · §§1, 2.1 a 2.5 y 3",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-49"
            }
          ]
        },
        {
          "id": "v3-bt49-119",
          "title": "3. Muebles eléctricos en el baño",
          "text": "Ser mueble no evita los volúmenes de BT-27\nUn espejo o mueble con equipo eléctrico en un cuarto con bañera o ducha debe cumplir los volúmenes y prescripciones de BT-27, además de BT-49.\nEstos muebles deben ser fijos. La conexión a la instalación fija se realiza mediante una caja fija con bornes, accesible después de retirar una tapa o cubierta con herramienta.\nLos dispositivos para conductores externos no se usan para conectar los internos del mueble. El borne de tierra, cuando exista, se identifica y se conecta a la tierra del edificio conforme al apartado.\nLa integración estética del equipo no elimina las restricciones de ubicación o conexión.\nIdea clave: En baño se comprueban tanto las condiciones del mueble como las del volumen donde se instala.\nComprobación: No. La instalación del mueble debe respetar también los volúmenes y prescripciones de BT-27.\nConfusión frecuente: 0,75 mm² no es el mínimo universal de un mueble. Con bases de toma de corriente, el mínimo de este apartado es 2,5 mm².",
          "references": [
            {
              "label": "ITC-BT-49 · §§1, 2.1 a 2.5 y 3",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-49"
            }
          ]
        }
      ]
    },
    {
      "id": "bt50",
      "title": "Locales con radiadores para saunas",
      "cards": [
        {
          "id": "v3-bt50-120",
          "title": "1. Ámbito y norma particular de saunas",
          "text": "BT-50 remite al detalle técnico\nBT-50 regula la instalación de equipos eléctricos en locales que contienen radiadores para saunas. Su texto remite a UNE 20.460-7-703.\nLa referencia y edición aplicables se consultan en BT-02. Para estudiar zonas, posiciones y equipos concretos hace falta la norma particular o el material docente autorizado que la desarrolla; esta ficha no la reproduce íntegramente.\nLa temperatura real afecta al aislamiento, al producto y a la capacidad de corriente del cable. Por eso, elegir por potencia o por un IP elevado no completa la selección.\nIdea clave: El calor exige aptitud térmica además de las medidas de envolvente y protección eléctrica.\nComprobación: En la norma particular aplicable de la familia 7-703 y el material autorizado que la desarrolla, contrastando su edición con BT-02.\nConfusión frecuente: No confundas el mapa de zonas de sauna con los volúmenes de baño. Un IP alto no demuestra resistencia a temperatura alta.",
          "references": [
            {
              "label": "ITC-BT-50 · §§1 y 2; ITC-BT-02; reglas relacionadas BT-19, BT-20, BT-24, BT-43 y BT-45",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-50"
            }
          ]
        },
        {
          "id": "v3-bt50-121",
          "title": "2. IP, temperatura y control térmico",
          "text": "Estanqueidad no demuestra resistencia al calor\nIP indica protección de envolvente; IK, resistencia a impactos. Ninguno acredita por sí solo la temperatura admisible de un cable o aparato.\nConsulta la zonificación de la norma particular de sauna. No uses directamente los volúmenes de baño porque ambos lugares puedan tener humedad.\nLas instrucciones del fabricante se cumplen junto con las prescripciones reglamentarias. El control normal de temperatura y la función de seguridad son diferentes; se verifican en la norma y en la documentación del producto.\nNo supongas una protección interna solo porque el equipo tiene una pantalla o termostato.\nIdea clave: La selección térmica y las funciones de seguridad se acreditan con sus condiciones específicas.\nComprobación: No. Debe ser apto para la temperatura, ubicación y condiciones de la norma particular y del fabricante.\nConfusión frecuente: No confundas el mapa de zonas de sauna con los volúmenes de baño. Un IP alto no demuestra resistencia a temperatura alta.",
          "references": [
            {
              "label": "ITC-BT-50 · §§1 y 2; ITC-BT-02; reglas relacionadas BT-19, BT-20, BT-24, BT-43 y BT-45",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-50"
            }
          ]
        },
        {
          "id": "v3-bt50-122",
          "title": "3. Usar la remisión sin inventar prescripciones",
          "text": "Reglas particulares junto a las generales\nLa remisión de BT-50 no crea una excepción general al REBT. Se aplican las condiciones generales de protección y cálculo, las del emplazamiento y las particulares de sauna que correspondan.\nCuando una pregunta requiere un valor que el literal de la ITC no desarrolla, busca la norma aplicable o el material autorizado del curso. No atribuyas al BOE una tabla que no está escrita en él.\nPara estudiar, anota junto a cada regla de dónde procede: ITC, norma técnica o indicación del producto. Así podrás consultarla y evitar mezclar ediciones o ámbitos.\nIdea clave: Una referencia normativa breve señala dónde está el detalle, no permite completar sus cifras por intuición.\nComprobación: No. Hay que consultar la zonificación y condiciones particulares de la norma de sauna.\nConfusión frecuente: No confundas el mapa de zonas de sauna con los volúmenes de baño. Un IP alto no demuestra resistencia a temperatura alta.",
          "references": [
            {
              "label": "ITC-BT-50 · §§1 y 2; ITC-BT-02; reglas relacionadas BT-19, BT-20, BT-24, BT-43 y BT-45",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-50"
            }
          ]
        }
      ]
    },
    {
      "id": "bt51",
      "title": "Automatización, energía y seguridad",
      "cards": [
        {
          "id": "v3-bt51-123",
          "title": "1. Entrada, nodo y actuador",
          "text": "Detectar → procesar → actuar\nUn sistema de automatización reparte tres funciones:\nEntrada: aporta información, como la señal de un detector de presencia.\nNodo: recibe y procesa información y participa en las decisiones de control.\nActuador: ejecuta la orden, por ejemplo, conmutar una carga.\nPueden estar integradas en uno o varios equipos. La función, no la forma ni la pantalla, decide cómo se clasifica un elemento.\nEn una arquitectura centralizada, la función de control se concentra en el elemento central del sistema.\nLa modalidad especialista de automatización es distinta de la de generadoras.\nIdea clave: Reconocer la función de cada componente permite entender el sistema sin memorizar marcas.\nComprobación: El actuador. El detector aporta la entrada y el control procesa la información.\nConfusión frecuente: Esta es otra modalidad especialista. No todos los aparatos automáticos independientes son un sistema domótico de BT-51.",
          "references": [
            {
              "label": "ITC-BT-51 · §§1, 2, 3 y 4; ITC-BT-03 · §3.2",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-51"
            }
          ]
        },
        {
          "id": "v3-bt51-124",
          "title": "2. Arquitecturas y medios de transmisión",
          "text": "Funciones de control y forma del cableado son cosas distintas\nEn una arquitectura descentralizada, las funciones de control se distribuyen entre nodos. La topología física del cableado no determina por sí sola esa distribución de funciones.\nBT-51 contempla varios medios de comunicación:\nCorrientes portadoras: señales transmitidas utilizando la red eléctrica.\nCables específicos: medio propio para las señales.\nSeñales radiadas: comunicación por el medio previsto.\nPueden combinarse cumpliendo las condiciones pertinentes. Determinados sistemas independientes se consideran aparatos y quedan fuera del ámbito específico, salvo la integración en sistemas más complejos que prevé la ITC.\nIdea clave: Un medio de comunicación no determina por sí solo si el control es centralizado o descentralizado.\nComprobación: Sí. Es un medio de transmisión, distinto de la distribución de funciones de control.\nConfusión frecuente: Esta es otra modalidad especialista. No todos los aparatos automáticos independientes son un sistema domótico de BT-51.",
          "references": [
            {
              "label": "ITC-BT-51 · §§1, 2, 3 y 4; ITC-BT-03 · §3.2",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-51"
            }
          ]
        },
        {
          "id": "v3-bt51-125",
          "title": "3. Documentación y alimentación de los equipos",
          "text": "Digital o inalámbrico también necesita protección eléctrica\nRespeta las instrucciones de instalación del sistema y de sus componentes. Se incorporan al proyecto o memoria técnica que corresponda; afectan a seguridad, compatibilidad y funcionamiento.\nLas partes alimentadas siguen teniendo condiciones eléctricas. Si se utiliza muy baja tensión, se aplican las prescripciones pertinentes de BT-36.\nQue un dispositivo sea digital, tenga una aplicación o se comunique sin cables no elimina el riesgo en su alimentación ni demuestra por sí solo aislamiento de protección.\nComprueba también el alcance profesional para la instalación integrada de BT-51.\nIdea clave: La electrónica y la comunicación no sustituyen documentación ni medidas de protección de alimentación.\nComprobación: No. Debe cumplir las condiciones de su alimentación, protección y montaje aunque las señales sean inalámbricas.\nConfusión frecuente: Esta es otra modalidad especialista. No todos los aparatos automáticos independientes son un sistema domótico de BT-51.",
          "references": [
            {
              "label": "ITC-BT-51 · §§1, 2, 3 y 4; ITC-BT-03 · §3.2",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-51"
            }
          ]
        }
      ]
    },
    {
      "id": "bt52",
      "title": "Recarga de vehículos eléctricos",
      "cards": [
        {
          "id": "ev-esquemas",
          "title": "1. Esquemas: de dónde sale la energía y dónde se mide",
          "text": "El esquema describe la instalación, no el modo de carga\nBT-52 §3 presenta los esquemas de alimentación y sus variantes:\n1: instalación colectiva o troncal, con contador principal para recarga.\n2: contador común para vivienda y recarga.\n3: instalación individual con contador para cada estación.\n4: circuitos adicionales en los supuestos descritos.\nReconoce en cada figura el contador, el origen del circuito y las estaciones. Eso te permite entender el esquema sin recordar solo un número.\nEl esquema 4 no es el modo de carga 4 ni el circuito C4 de vivienda.\nIdea clave: Para reconocer un esquema, sigue el recorrido de alimentación y la posición del contador.\nComprobación: La disposición de alimentación y medida de la instalación, no el modo de carga del vehículo.\nConfusión frecuente: Esquema 4 no significa modo 4. C4 de vivienda tampoco es ese esquema.",
          "references": [
            {
              "label": "ITC-BT-52 · §2–3",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-52"
            }
          ]
        },
        {
          "id": "ev-spl",
          "title": "2. Previsión de carga y sistema SPL",
          "text": "0,3 solo en el supuesto previsto con SPL\nEl SPL, sistema de protección de la línea general de alimentación, puede evitar sobrecargas ajustando la demanda de recarga en las condiciones previstas.\nEn el supuesto del esquema 1 de BT-52 §4.1, el factor entre recarga y resto de instalación puede ser 0,3 con SPL; sin él se toma 1. No es un descuento universal del 70 % de toda la carga del edificio.\nLa simultaneidad entre estaciones del circuito colectivo se comprueba según §5; no se traslada ciegamente ese factor.\nLa previsión de BT-10 de 3.680 W ×10 % de plazas pertenece a su supuesto. No equivale a una regla universal de dotación física de plazas.\nIdea clave: El factor depende del esquema, el SPL y la relación entre cargas que se está calculando.\nComprobación: No. Hay que comprobar el supuesto reglamentario, el esquema y las condiciones del SPL.\nConfusión frecuente: Previsión de potencia del 10 % no es una regla universal de dotación física o preinstalación de plazas.",
          "references": [
            {
              "label": "ITC-BT-52 · §4.1 y §5",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-52"
            },
            {
              "label": "ITC-BT-10 · §3.5",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-10"
            }
          ]
        },
        {
          "id": "ev-prot",
          "title": "3. Proteger individualmente cada punto",
          "text": "Diferencial ≤30 mA · tipo A como mínimo\nCada punto de conexión requiere protección diferencial individual de sensibilidad máxima 30 mA y tipo A como mínimo conforme a BT-52.\nLa recarga puede presentar componentes continuas: deben resolverse con las normas aplicables y la documentación del equipo. El mínimo tipo A no significa que cualquier tipo A baste en todo montaje.\nSe comprueban además sobrecarga y cortocircuito, sobretensiones aplicables, continuidad del PE y coordinación con las protecciones aguas arriba.\nUn diferencial general de 300 mA no sustituye la protección individual de los puntos.\nIdea clave: Cada punto debe tener la protección prescrita y ser compatible con las características de la recarga.\nComprobación: No. La protección individual de cada punto debe cumplir su sensibilidad y tipo correspondientes.\nConfusión frecuente: Un único diferencial general de 300 mA no sustituye protección individual de puntos.",
          "references": [
            {
              "label": "ITC-BT-52 · §6.1, §6.3–6.4",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-52"
            }
          ]
        },
        {
          "id": "ev-doc",
          "title": "4. Caída de tensión, proyecto e inspección",
          "text": "Caída ≤5 % · modo 4 exige proyecto\nLa caída máxima desde el origen del circuito VE hasta el punto de conexión es del 5 %. La sección también debe cumplir intensidad, corto, mínimos y condiciones de instalación.\nBT-04 contempla proyecto para infraestructura de recarga:\nPotencia superior a 50 kW.\nSituada en exterior, potencia superior a 10 kW.\nSi incluye modo de carga 4, sin límite de potencia.\nLa infraestructura que precisa proyecto requiere inspección inicial por el supuesto de BT-05 §4.1.h. Revisa siempre otros supuestos concurrentes.\nIdea clave: El modo 4 genera una causa de proyecto que no depende de superar un umbral de kW.\nComprobación: No. La instalación que incluye modo 4 requiere proyecto sin límite de potencia.\nConfusión frecuente: Modo 4 pequeño no está exento por no superar 10 o 50 kW. No leer «esquema 4» en su lugar.",
          "references": [
            {
              "label": "ITC-BT-52 · §5",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-52"
            },
            {
              "label": "ITC-BT-04 · §3.1.z",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-4"
            },
            {
              "label": "ITC-BT-05 · §4.1.h",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-5"
            }
          ]
        },
        {
          "id": "ev-modos",
          "title": "5. Qué significa el modo de carga",
          "text": "Modo 4: cargador externo que entrega CC\nEl modo de carga describe la conexión y el control de la carga del vehículo, incluida la relación con su equipo de alimentación.\nEn modo 3 hay equipamiento específico de recarga y control conforme a la definición. En modo 4, el cargador está fuera del vehículo y le entrega corriente continua.\nNo deduzcas el modo solo por la potencia, por el número de fases o por el aspecto del conector. Comprueba BT-52 §2 y la documentación del equipo.\nEl modo y el esquema de alimentación responden a preguntas diferentes y pueden combinarse en la instalación.\nIdea clave: La posición y función del cargador ayudan a reconocer el modo; los kW por sí solos no bastan.\nComprobación: Fuera del vehículo; entrega corriente continua al vehículo.\nConfusión frecuente: kW, modo, esquema y tipo de conector son datos relacionados pero no intercambiables.",
          "references": [
            {
              "label": "ITC-BT-52 · §2",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-52"
            }
          ]
        },
        {
          "id": "v3-bt52-126",
          "title": "6. No mezclar modo 4, esquema 4 y circuito C4",
          "text": "Tres clasificaciones con funciones distintas\nModo 4: forma de carga con cargador externo y salida CC al vehículo.\nEsquema 4: disposición de circuitos adicionales de alimentación en BT-52.\nCircuito C4: circuito doméstico definido en BT-25; su número no identifica el modo de un cargador.\nAntes de responder, completa la frase del enunciado: «modo de carga», «esquema de instalación» o «circuito de vivienda».\nLa misma precaución vale para el factor 0,3: identifica la previsión y el SPL del supuesto; no lo apliques a cualquier equipo que tenga un número 4.\nIdea clave: Un mismo número no convierte en equivalentes tres clasificaciones distintas.\nComprobación: No. Se habla del modo de carga; el número de esquema es otra clasificación.\nConfusión frecuente: Modo 4 no es circuito C4. No se aplica 0,3 a toda instalación de VE sin comprobar esquema y SPL.",
          "references": [
            {
              "label": "ITC-BT-52 · §§2, 3 y 4; ITC-BT-25 · tabla 1",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-52"
            }
          ]
        }
      ]
    },
    {
      "id": "fv",
      "title": "Fotovoltaica y baterías",
      "cards": [
        {
          "id": "fv-datos",
          "title": "1. Leer la ficha del módulo fotovoltaico",
          "text": "Voc e Isc son límites; Vmp e Imp describen el trabajo\nVoc: tensión en circuito abierto, sin entregar corriente.\nIsc: corriente de cortocircuito, en la condición de ensayo correspondiente.\nVmp e Imp: tensión y corriente del punto de máxima potencia.\nLa potencia de ese punto es Pmp ≈ Vmp ×Imp. Ejemplo: 32 V ×12,5 A = 400 W. No se obtiene multiplicando Voc por Isc.\nSTC son condiciones de referencia: irradiancia 1.000 W/m², temperatura de célula 25 °C y espectro AM1,5. No prometen producción constante en una cubierta ni significan 25 °C de temperatura ambiente.\nIdea clave: La ficha distingue el funcionamiento útil de las condiciones de circuito abierto y cortocircuito.\nComprobación: 400 W: 32 ×12,5. Voc e Isc no se multiplican para obtener Pmp.\nConfusión frecuente: 25 °C STC es temperatura de célula, no simplemente temperatura ambiente.",
          "references": [
            {
              "label": "Electrotecnia · desarrollo didáctico propio, no texto literal REBT",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-3"
            },
            {
              "label": "JRC / Comisión Europea · PVGIS, conceptos y condiciones de referencia",
              "url": "https://joint-research-centre.ec.europa.eu/photovoltaic-geographical-information-system-pvgis/general-information/frequently-asked-questions_en"
            },
            {
              "label": "Sandia National Laboratories · PVPMC, modelo eléctrico y temperatura",
              "url": "https://pvpmc.sandia.gov/modeling-guide/2-dc-module-iv/point-value-models/sandia-pv-array-performance-model/"
            }
          ]
        },
        {
          "id": "strings",
          "title": "2. Cadenas en serie y en paralelo",
          "text": "Serie suma tensiones · paralelo suma corrientes\nUna cadena o string agrupa módulos conectados en serie. En el modelo de ejercicio con módulos iguales, sus tensiones se suman y la corriente de la cadena se mantiene.\nEjemplo: diez módulos de Vmp = 32 V e Imp = 10 A forman una cadena de 320 V y 10 A en ese punto.\nDos cadenas iguales en paralelo comparten tensión y suman corriente: 320 V y 20 A. No son 640 V.\nVoc e Isc se usan en sus comprobaciones de límites; Vmp e Imp, en el punto de trabajo. Sombras y diferencias entre módulos o cadenas modifican el funcionamiento real.\nIdea clave: La conexión cambia de manera distinta tensión y corriente; calcula cada magnitud por separado.\nComprobación: 320 V y 20 A. En paralelo se mantiene la tensión y se suman corrientes.\nConfusión frecuente: Diez módulos de 10 A en serie no producen 100 A de cadena.",
          "references": [
            {
              "label": "Electrotecnia · desarrollo didáctico propio, no texto literal REBT",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-3"
            },
            {
              "label": "Sandia National Laboratories · PVPMC, modelo eléctrico y temperatura",
              "url": "https://pvpmc.sandia.gov/modeling-guide/2-dc-module-iv/point-value-models/sandia-pv-array-performance-model/"
            }
          ]
        },
        {
          "id": "fv-temperatura",
          "title": "3. Corregir Voc con la temperatura",
          "text": "Si βVoc es negativo, el frío aumenta Voc\nModelo lineal de ejercicio:\nVoc(T) = Voc_STC ×[1 +βVoc ×(T −25)].\nUsa β en 1/°C. Si la ficha indica −0,30 %/°C, convierte a −0,003/°C.\nEjemplo: Voc_STC = 40 V y T = −10 °C → 40 ×[1 +(−0,003) ×(−35)] = 44,2 V. El frío ha aumentado la tensión.\nPara el máximo de módulos en serie, toma el entero inferior que respete la tensión CC admisible con Voc en frío, temperatura de diseño y tolerancias. Comprueba también Vmp en frío y calor, rango MPPT y arranque: cumplir solo la tensión máxima no basta.\nIdea clave: Convierte el porcentaje, calcula el caso frío y nunca redondees hacia arriba un máximo de módulos.\nComprobación: A más: 44,2 V a −10 °C con βVoc = −0,003/°C.\nConfusión frecuente: −0,30 %/°C es −0,003/°C, no −0,30. No redondear el número máximo de módulos hacia arriba.",
          "references": [
            {
              "label": "Electrotecnia · desarrollo didáctico propio, no texto literal REBT",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-3"
            },
            {
              "label": "Sandia National Laboratories · PVPMC, modelo eléctrico y temperatura",
              "url": "https://pvpmc.sandia.gov/modeling-guide/2-dc-module-iv/point-value-models/sandia-pv-array-performance-model/"
            }
          ]
        },
        {
          "id": "mppt",
          "title": "4. Revisar todos los límites del inversor",
          "text": "Tensión, corriente y potencia son comprobaciones independientes\nEl MPPT sigue el punto de máxima potencia del campo conectado. Por entrada o grupo MPPT revisa:\nTensión CC máxima y rango de seguimiento.\nTensión de arranque.\nCorriente máxima de entrada e Isc admisible.\nConfiguración permitida de cadenas y potencia del campo.\nDos conectores físicos pueden compartir el mismo MPPT: no deduzcas dos seguimientos independientes contando conectores.\nEn CA comprueba potencia, corriente, fases y protecciones. El recorte de potencia o clipping no autoriza superar tensión o corriente máximas. Los kWp de módulos y los kW CA del inversor son magnitudes distintas.\nIdea clave: Una configuración puede cumplir potencia y seguir incumpliendo tensión o corriente.\nComprobación: No. Hay que comprobar tensión, corriente, arranque, rango MPPT y configuración permitida por separado.\nConfusión frecuente: No elegir la cadena solo porque la suma de kWp parece adecuada.",
          "references": [
            {
              "label": "Electrotecnia · desarrollo didáctico propio, no texto literal REBT",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-3"
            },
            {
              "label": "ITC-BT-40 · §4.3–7",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-40"
            }
          ]
        },
        {
          "id": "fv-cc",
          "title": "5. Cableado y protección de las cadenas CC",
          "text": "Aptitud para CC y condiciones del campo fotovoltaico\nLos módulos iluminados pueden mantener tensión aunque el inversor esté apagado. Apagar su pantalla no convierte el campo en una instalación sin energía.\nLos dispositivos de corte y seccionamiento deben estar admitidos para CC, tensión y corriente del circuito. No se separan conectores de cadena bajo carga como maniobra.\nLa necesidad de protección de cadenas considera corriente inversa posible, número de paralelos y límites del módulo. No se decide por una regla genérica de «un fusible siempre».\nComprueba además polaridad, compatibilidad de conectores, UV, temperatura, protección mecánica y puesta a tierra de masas según el diseño y documentación.\nIdea clave: El cableado CC debe diseñarse y verificarse con sus límites y dispositivos específicos.\nComprobación: No. Debe acreditar aptitud para la corriente continua, tensión y corriente de ese circuito.\nConfusión frecuente: No presumir que un automático solo marcado CA puede cortar la cadena CC.",
          "references": [
            {
              "label": "ITC-BT-40 · §5–8",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-40"
            },
            {
              "label": "ITC-BT-19 · §2.2",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-19"
            },
            {
              "label": "Electrotecnia · desarrollo didáctico propio, no texto literal REBT",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-3"
            }
          ]
        },
        {
          "id": "bateria",
          "title": "6. Batería: energía, potencia y autonomía",
          "text": "kWh almacenados no son kW de salida\nUna estimación de energía nominal es E[kWh] ≈ V nominal ×Ah/1.000. La energía entregable se reduce por la fracción utilizable y el rendimiento del camino de descarga.\nEjemplo: 48 V ×200 Ah = 9,6 kWh nominales. Con 90 % utilizable y rendimiento 90 %, se estiman 7,78 kWh entregables. A una carga media de 2 kW, la autonomía estimada es 3,89 horas.\nLa corriente de batería se estima como I ≈ P salida/(V batería ×η inversor). Comprueba tensión mínima, potencia continua y picos, BMS, cable y protección.\nLa conexión en serie o paralelo y la compatibilidad dependen del fabricante.\nIdea clave: La capacidad decide cuánta energía hay; los límites de potencia deciden qué carga puede alimentarse.\nComprobación: No. Los kWh indican energía; la potencia máxima depende de la batería, BMS, inversor y demás límites.\nConfusión frecuente: 15 kWh no garantiza entregar 15 kW. Una tensión menor exige más corriente para la misma potencia.",
          "references": [
            {
              "label": "Electrotecnia · desarrollo didáctico propio, no texto literal REBT",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-3"
            },
            {
              "label": "ITC-BT-40 · §5–8",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-40"
            }
          ]
        },
        {
          "id": "produccion",
          "title": "7. Producción estimada y balance instantáneo",
          "text": "E ≈ kWp ×HSP ×PR\nPara un ejercicio diario, HSP son horas solares pico equivalentes y PR un rendimiento global. Ejemplo: 5 kWp ×4 HSP ×0,8 = 16 kWh estimados. Las horas con luz no son automáticamente HSP.\nPara una instalación sin batería y un instante concreto:\nAutoconsumo = mínimo entre generación y demanda.\nExcedente = máximo entre generación −demanda y cero.\nImportación = máximo entre demanda −generación y cero.\nSi se generan 4 kW y se demandan 6 kW: autoconsumo 4 kW, importación 2 kW y excedente cero. Para obtener kWh hay que considerar el tiempo. Una estimación didáctica no es una garantía local de producción.\nIdea clave: El balance instantáneo se expresa en potencia; la energía requiere sumar esa potencia en el tiempo.\nComprobación: 2 kW. El autoconsumo es 4 kW y no hay excedente en ese instante.\nConfusión frecuente: Horas de luz no son HSP. No presentar diferencia de potencias como kWh sin intervalo.",
          "references": [
            {
              "label": "Electrotecnia · desarrollo didáctico propio, no texto literal REBT",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-3"
            },
            {
              "label": "JRC / Comisión Europea · PVGIS, conceptos y condiciones de referencia",
              "url": "https://joint-research-centre.ec.europa.eu/photovoltaic-geographical-information-system-pvgis/general-information/frequently-asked-questions_en"
            }
          ]
        }
      ]
    },
    {
      "id": "auto",
      "title": "Autoconsumo y antivertido",
      "cards": [
        {
          "id": "modalidad",
          "title": "1. Con y sin excedentes: qué cambia",
          "text": "Sin excedentes debe impedir la inyección a red\nRD 244/2019 distingue:\nSin excedentes: debe existir un mecanismo antivertido que impida inyectar energía excedentaria a la red.\nCon excedentes: la instalación puede inyectarlos con el régimen correspondiente, acogido o no a compensación.\nIndividual o colectivo indica cuántos consumidores están asociados. Aislada, asistida o interconectada describe la conexión según BT-40. Son clasificaciones diferentes.\nUna batería no determina automáticamente la modalidad. La instalación cumple los requisitos técnicos y documentales aplicables aunque se configure para exportar cero.\nIdea clave: Clasifica exportación, número de consumidores y conexión por separado.\nComprobación: No. La modalidad depende de las condiciones de exportación y de la instalación, no de la presencia de batería por sí sola.\nConfusión frecuente: Sin excedentes no equivale a aislada ni a «sin trámites».",
          "references": [
            {
              "label": "RD 244/2019 · arts. 4–5",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2019-5089"
            }
          ]
        },
        {
          "id": "antivertido",
          "title": "2. Cómo funciona el sistema antivertido",
          "text": "Medir → controlar → actuar → verificar\nEl antivertido utiliza la medida del intercambio con la red, un control y la actuación sobre la generación para impedir la exportación en la modalidad sin excedentes.\nSu conformidad se comprueba para la configuración concreta según el anexo I de BT-40 y la documentación o certificación correspondiente.\nImportan la ubicación y orientación de sensores, la correspondencia de fases, las comunicaciones y la respuesta ante las condiciones previstas. Si la medida es incorrecta, el control puede interpretar mal el intercambio.\nVer «zero export» en una pantalla no acredita por sí solo cumplimiento. Antivertido no sustituye antiisla, y no se anula una protección para corregir un error de medida.\nIdea clave: El antivertido es un sistema completo cuya medida, respuesta y configuración deben ser correctas.\nComprobación: No. Hay que comprobar la configuración, medida, respuesta y documentación de conformidad aplicable.\nConfusión frecuente: Antivertido no sustituye antiisla. No se anula una protección para corregir un error de medida.",
          "references": [
            {
              "label": "ITC-BT-40 · anexo I",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-40"
            },
            {
              "label": "RD 244/2019 · art. 4.1.a",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2019-5089"
            }
          ]
        },
        {
          "id": "compensacion",
          "title": "3. Qué permite la compensación simplificada",
          "text": "≤100 kW y todas las demás condiciones\nEl artículo 4.2.a exige conjuntamente origen renovable, potencia total asociada no superior a 100 kW, los contratos previstos y ausencia del régimen retributivo adicional o específico indicado. Alcanzar el umbral no basta para cumplir todos los requisitos.\nLa compensación de excedentes es económica. El artículo 14 limita su valor al de la energía consumida de red en el período de facturación, que no puede superar un mes.\nEjemplo conceptual: una compensación calculada mayor que ese valor se limita por la regla legal; no crea una bolsa ilimitada de kWh ni garantiza que desaparezcan todos los conceptos de la factura.\nLos servicios comerciales llamados «batería virtual» tienen sus propias condiciones y no son la definición legal de compensación.\nIdea clave: La compensación tiene condiciones de acceso y un límite económico de período.\nComprobación: No. Se deben cumplir a la vez las demás condiciones del artículo 4.2.a y el contrato correspondiente.\nConfusión frecuente: No confundir compensación legal con servicios comerciales de «batería virtual».",
          "references": [
            {
              "label": "RD 244/2019 · arts. 4.2.a y 14",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2019-5089"
            }
          ]
        },
        {
          "id": "colectivo",
          "title": "4. Proximidad y acuerdo de reparto",
          "text": "La proximidad tiene varias alternativas\nEn autoconsumo colectivo hay varios consumidores asociados y un acuerdo de reparto; los coeficientes distribuyen la energía conforme al anexo I.\nEl artículo 3.g no define proximidad por una sola distancia. Contempla conexión interior o directa, redes de baja tensión del mismo centro de transformación, distancia y referencia catastral en sus supuestos.\nTexto del BOE comprobado el 05/10/2026 (actualización de 21/03/2026): entre las alternativas de distancia existe FV o eólica de hasta 5 MW conectada a través de red a distancia inferior a 5.000 m, con sus condiciones. La distancia se mide entre equipos de medida en proyección ortogonal en planta.\nConsulta la redacción vigente antes de aplicar un caso; ni «siempre 500 m» ni distancia por carretera son reglas correctas.\nIdea clave: Proximidad y reparto se justifican según la alternativa y las condiciones legales aplicables.\nComprobación: No. En el supuesto de distancia del artículo 3.g se mide entre equipos de medida en proyección ortogonal en planta.\nConfusión frecuente: No usar por costumbre «siempre 500 m» ni distancia por carretera. Revisar texto vigente antes del examen.",
          "references": [
            {
              "label": "RD 244/2019 · art. 3.g y anexo I",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2019-5089"
            }
          ]
        },
        {
          "id": "potencia-fv",
          "title": "5. Qué potencia instalada usa RD 244/2019",
          "text": "FV: máxima del inversor o suma de máximas\nPara fotovoltaica, el artículo 3.h de RD 244/2019 define la potencia instalada como la máxima del inversor o la suma de las máximas de los inversores.\nEjemplo: un campo de módulos de 12 kWp con un inversor cuya máxima es 10 kW tiene 10 kW instalados a efectos de esa definición. Los 12 kWp siguen describiendo el campo fotovoltaico en referencia.\nkW: potencia activa.\nkWp: potencia pico fotovoltaica de referencia.\nkWh: energía.\nkVA: potencia aparente.\nEn cada trámite o cálculo, utiliza la definición que le corresponde.\nIdea clave: La misma instalación puede tener magnitudes distintas de campo FV, inversor y energía producida.\nComprobación: 10 kW, por la definición fotovoltaica del artículo 3.h.\nConfusión frecuente: Un campo de 12 kWp con inversor de 10 kW no tiene automáticamente 12 kW instalados a todos los efectos.",
          "references": [
            {
              "label": "RD 244/2019 · art. 3.h",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2019-5089"
            },
            {
              "label": "Electrotecnia · desarrollo didáctico propio, no texto literal REBT",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-3"
            }
          ]
        },
        {
          "id": "tramites",
          "title": "6. Ordenar la documentación de autoconsumo",
          "text": "No existe un único trámite que lo cubra todo\nOrganiza el expediente por su finalidad:\nDiseño: proyecto o memoria técnica, según el caso.\nEjecución y puesta en servicio: certificado de instalación y procedimiento autonómico aplicable.\nRelación con la red: permisos de acceso y conexión cuando procedan.\nRégimen de autoconsumo: contratos, comunicación y registros correspondientes.\nLas exenciones dependen de modalidad, potencia, ubicación y requisitos legales. Por ejemplo, una exención de permiso no equivale a exención de todas las obligaciones.\nLa ficha del inversor no sustituye el certificado de la instalación completa. La cualificación personal y la habilitación de la empresa son también asuntos distintos.\nIdea clave: Relaciona cada documento con su finalidad y comprueba las exenciones una a una.\nComprobación: No. La conformidad del producto y la documentación de la instalación cumplen finalidades diferentes.\nConfusión frecuente: No afirmar «sin vertido no necesita nada» ni «aprobar permite legalizar al margen de empresa».",
          "references": [
            {
              "label": "RD 244/2019 · arts. 7–9 y 19–21",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2019-5089"
            },
            {
              "label": "ITC-BT-04 · §5",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-4"
            },
            {
              "label": "ITC-BT-03 · §4–5",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-3"
            }
          ]
        }
      ]
    },
    {
      "id": "pract",
      "title": "Práctica, medidas y preparación del examen",
      "cards": [
        {
          "id": "practicas",
          "title": "1. Prueba teórica y práctica se superan por separado",
          "text": "Básica: dos pruebas prácticas · especialista: una\nLa documentación ASELAR ITE-04, edición 5, describe dos pruebas prácticas de básica: montaje/puesta en servicio y verificación/mantenimiento. Cada especialidad tiene una prueba práctica de su alcance.\nTeoría y práctica se superan por separado. Un buen test no compensa una práctica no apta.\nConfirma con el centro la formación, admisión, convocatoria y condiciones de recuperación que te correspondan. Esta web ayuda a preparar conceptos y razonamiento; la destreza se trabaja en prácticas supervisadas.\nIdea clave: Prepara la práctica como una parte independiente de la evaluación.\nComprobación: No. Las partes teórica y práctica deben superarse por separado.\nConfusión frecuente: No se compensa una práctica no apta con una nota teórica alta.",
          "references": [
            {
              "label": "ASELAR · ITE-04 ed.5 §4.2–4.4",
              "url": "https://www.aselar.info/wp-content/uploads/2024/02/ITE-04-ICBT_Realizacion_y_evaluacion_de_Examenes_Ed5.pdf"
            },
            {
              "label": "ASELAR · condiciones de acceso",
              "url": "https://www.aselar.info/instalador-certificado-baja-tension-categoria-basica/"
            }
          ]
        },
        {
          "id": "seguridad",
          "title": "2. Comprender el trabajo sin tensión",
          "text": "Desconectar una fuente no demuestra ausencia de tensión\nEl anexo II de RD 614/2001 establece el proceso: desconectar, impedir realimentación, verificar ausencia de tensión, poner a tierra y en cortocircuito en los supuestos previstos, y proteger frente a partes próximas en tensión y delimitar.\nEn baja tensión, la puesta a tierra y en cortocircuito se exige cuando la instalación pueda ponerse accidentalmente en tensión por inducción u otras razones del apartado; no se improvisa como una operación idéntica en todo circuito.\nEn FV, abrir el IGA puede dejar CC de módulos y batería. Se identifican todas las fuentes y la energía residual.\nLas actuaciones reales corresponden a personal autorizado y competente con su procedimiento. Para estudiar solo, utiliza papel o simulación sin energía.\nIdea clave: La ausencia de tensión se verifica en la zona y elementos afectados después de controlar todas las fuentes.\nComprobación: No. Pueden permanecer otras fuentes y energía residual; deben identificarse y verificarse según el procedimiento.\nConfusión frecuente: Pantalla apagada, etiqueta o IGA abierto no demuestran ausencia de tensión en todas las fuentes.",
          "references": [
            {
              "label": "RD 614/2001 · anexo II",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2001-11881"
            }
          ]
        },
        {
          "id": "instrumentos",
          "title": "3. Elegir instrumento según la verificación",
          "text": "Cada medida tiene un método y condiciones propias\nQué se comprueba | Instrumento o función | \nContinuidad del PE | Medida de continuidad | \nAislamiento | Medidor de aislamiento; preparación sin tensión y compatible con los equipos | \nResistencia de tierra | Telurómetro y método adecuado | \nDiferencial | Comprobador de corriente y tiempo de disparo | \nBucle y corriente de cortocircuito prevista | Equipo y método apropiados | \nIluminancia | Luxómetro | \nEl botón TEST del diferencial verifica una función del aparato; no mide la tierra ni sustituye la comprobación instrumental completa.\nEl procedimiento determina estado de alimentación, categoría y rango del equipo, preparación y criterios de aceptación. Las pruebas con tensión corresponden a personal competente.\nIdea clave: Antes de medir, define magnitud, instrumento, estado de la instalación y criterio de aceptación.\nComprobación: No. No mide la tierra y no sustituye las verificaciones instrumentales correspondientes.\nConfusión frecuente: TEST del diferencial no mide tierra ni sustituye la comprobación instrumental completa.",
          "references": [
            {
              "label": "ITC-BT-03 · apéndice I",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-3"
            },
            {
              "label": "ITC-BT-05 · §3",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-5"
            },
            {
              "label": "ITC-BT-19 · §2.9",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-19"
            },
            {
              "label": "ITC-BT-18 · §12",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-18"
            }
          ]
        },
        {
          "id": "verificacion",
          "title": "4. Un guion para estudiar la verificación FV",
          "text": "Inspeccionar → ensayar → comprobar funciones → registrar\nPara preparar el razonamiento en una simulación, sigue cuatro bloques:\nInspección: reconocer esquema y fuentes; revisar componentes, marcado, polaridad, conexiones y protección.\nEnsayos: decidir continuidad, aislamiento y medidas aplicables, con preparación y compatibilidad de los equipos.\nFunciones: comprobar las previstas en el diseño, como interfaz, antivertido y respaldo.\nRegistro: anotar método, instrumento, resultado con unidad, criterio de aceptación e incidencias.\nEjemplo de documentación: escribir solo «0,8» no permite saber qué se midió ni si cumple. Hay que indicar magnitud, unidad y condición de la prueba.\nEste guion organiza el estudio; no sustituye el procedimiento de una intervención real en CC.\nIdea clave: Una verificación se justifica con método, resultados y criterios, no solo con que el sistema funcione.\nComprobación: La magnitud, unidad, método y condición de medida, instrumento y criterio para decidir si es aceptable.\nConfusión frecuente: Un número sin unidad ni criterio no demuestra conformidad.",
          "references": [
            {
              "label": "ITC-BT-05 · §3",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-5"
            },
            {
              "label": "ITC-BT-40 · §5–8 y anexo I",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-40"
            },
            {
              "label": "ITC-BT-03 · apéndice II",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-3"
            }
          ]
        },
        {
          "id": "formato",
          "title": "5. Formato del simulacro y puntuación",
          "text": "Básica 40/120 min · especialista 10/30 min\nEl formato de referencia ASELAR edición 5 es 40 preguntas en dos horas para básica y 10 en 30 minutos para cada especialidad, con tres opciones y una correcta.\nLa puntuación es acierto +1; fallo −0,3; blanco 0. El corte es el 70 % de las preguntas válidas: sin anulaciones, 28/40 o 7/10.\nEn cálculos, escribir las operaciones afecta a la valoración parcial. El simulador no evalúa tu desarrollo: revísalo aparte.\nEjemplo: 30 aciertos y 10 fallos dan 30 −3 = 27 puntos, por debajo de 28.\nConfirma convocatoria y material permitido; no presupongas consulta libre de apuntes en todo el examen.\nIdea clave: Para preparar el corte, cuenta penalizaciones y escribe las operaciones de los cálculos.\nComprobación: No. La puntuación es 30 −0,3 ×10 = 27 puntos.\nConfusión frecuente: 30 correctas completas y 10 fallos son 27 puntos: no apto.",
          "references": [
            {
              "label": "ASELAR · instrucciones ed.5, puntos 7–12",
              "url": "https://www.aselar.info/wp-content/uploads/2024/11/Anexo_IV_ITE-04-ICBT_Instrucciones_Ed5.pdf"
            },
            {
              "label": "ASELAR · ITE-04 ed.5 §4.2 y §4.4",
              "url": "https://www.aselar.info/wp-content/uploads/2024/02/ITE-04-ICBT_Realizacion_y_evaluacion_de_Examenes_Ed5.pdf"
            }
          ]
        },
        {
          "id": "estrategia",
          "title": "6. Estudiar el error para no repetirlo",
          "text": "Concepto, lectura, cálculo o búsqueda\nEn una primera vuelta resuelve lo claro. Si te bloqueas, marca la pregunta y vuelve después. Una pauta de unos 40 segundos para decidir seguir es una estrategia de estudio, no una norma oficial.\nEn cada cálculo escribe: datos → unidades → fórmula → sustitución → resultado con unidad. Comprueba si pide máximo o mínimo, > o ≥, potencia útil o absorbida, CA o CC.\nDespués de un fallo, clasifícalo:\nConcepto: explica la idea con tus palabras.\nLectura: identifica la condición que omitiste.\nCálculo: repite unidades y operación.\nBúsqueda: localiza el apartado exacto.\nResuelve luego un caso distinto y repásalo al día siguiente y una semana después. Recordar una letra no demuestra que puedas resolverlo.\nIdea clave: El repaso útil corrige la causa del fallo y comprueba que sabes aplicarlo a otro caso.\nComprobación: Resolver un caso nuevo y explicar el razonamiento; así compruebas el concepto y no solo una respuesta memorizada.\nConfusión frecuente: Memorizar la letra de una pregunta repetida no demuestra poder resolver un caso nuevo.",
          "references": [
            {
              "label": "ASELAR · instrucciones ed.5, puntos 7–12",
              "url": "https://www.aselar.info/wp-content/uploads/2024/11/Anexo_IV_ITE-04-ICBT_Instrucciones_Ed5.pdf"
            },
            {
              "label": "Electrotecnia · desarrollo didáctico propio, no texto literal REBT",
              "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099#ib-3"
            }
          ]
        }
      ]
    }
  ]
};
