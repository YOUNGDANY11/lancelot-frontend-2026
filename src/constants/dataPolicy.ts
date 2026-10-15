export const DATA_POLICY_CONTACT_EMAIL = 'verafutbolclub@gmail.com'

export interface DataPolicySection {
  title: string
  paragraphs?: string[]
  items?: string[]
}

export interface DataPolicyContent {
  title: string
  version: string
  intro: string
  sections: DataPolicySection[]
}

export const DATA_POLICY: DataPolicyContent = {
  title: 'Política de tratamiento de datos personales',
  version: 'Versión 2026-10 · vigente desde octubre de 2026',
  intro:
    'Lancelot es la plataforma que el club usa para el seguimiento físico, técnico y médico de sus deportistas. Esta política explica qué datos se tratan, para qué y cómo puedes ejercer tus derechos, conforme a la Ley 1581 de 2012 y el Decreto 1377 de 2013.',
  sections: [
    {
      title: 'Responsable del tratamiento',
      paragraphs: [
        `El responsable es VERA FC, club que administra la plataforma. Para cualquier consulta o reclamo escribe a ${DATA_POLICY_CONTACT_EMAIL}.`,
      ],
    },
    {
      title: 'Datos que se tratan',
      items: [
        'Identificación y contacto: nombres, apellidos, correo y fecha de nacimiento.',
        'Datos deportivos: evaluaciones físicas y técnicas, cargas de entrenamiento (RPE), estadísticas de partidos, objetivos y categorías.',
        'Datos de salud: lesiones y registros de salud. Son datos sensibles y solo los ven los roles autorizados por el club.',
      ],
    },
    {
      title: 'Finalidades',
      items: [
        'Hacer el seguimiento del proceso formativo del deportista a lo largo de categorías y temporadas.',
        'Controlar la carga de entrenamiento y generar alertas que ayuden a prevenir lesiones.',
        'Calcular índices de progreso y sugerir deportistas con potencial de ascenso. Las decisiones las toman siempre personas del club.',
        'Elaborar análisis estadísticos con datos seudonimizados, sin nombres, correos ni diagnósticos, para mejorar los modelos de apoyo a la decisión.',
      ],
    },
    {
      title: 'Datos sensibles y de menores de edad',
      paragraphs: [
        'No estás obligado a autorizar el tratamiento de datos sensibles, como los de salud. Si lo autorizas, su acceso queda restringido por rol y cada consulta queda registrada.',
        'Los datos de los menores de edad se tratan respetando su interés superior y solo con la autorización de su padre, madre o acudiente, que el club registra en la plataforma.',
      ],
    },
    {
      title: 'Tus derechos como titular',
      items: [
        'Conocer, actualizar y rectificar tus datos personales.',
        'Solicitar prueba de la autorización que otorgaste.',
        'Ser informado sobre el uso que se ha dado a tus datos.',
        'Revocar la autorización o pedir la supresión de tus datos cuando no se respeten los principios, derechos y garantías de la ley.',
        'Acceder gratuitamente a tus datos.',
        'Presentar quejas ante la Superintendencia de Industria y Comercio.',
      ],
    },
    {
      title: 'Cómo ejercer tus derechos',
      paragraphs: [
        `Escribe a ${DATA_POLICY_CONTACT_EMAIL} indicando tu nombre, tu correo registrado y tu solicitud. Las consultas se responden en máximo diez días hábiles y los reclamos en máximo quince días hábiles.`,
        'Puedes actualizar tus nombres, apellidos, correo y fecha de nacimiento en cualquier momento desde Mi perfil.',
      ],
    },
    {
      title: 'Seguridad de la información',
      paragraphs: [
        'Las contraseñas se guardan cifradas, el acceso a cada módulo depende del rol, los accesos a los datos de salud quedan auditados y el navegador no guarda datos personales ni de salud.',
      ],
    },
  ],
}

export const DATA_POLICY_CONSENT = {
  checkboxLabel: 'Autorizo el tratamiento de mis datos personales',
  checkboxHint: 'Según la política de tratamiento de datos de la Ley 1581 de 2012.',
  readPolicy: 'Leer la política',
  required: 'Debes autorizar el tratamiento de tus datos para crear la cuenta.',
  gateTitle: 'Autoriza el tratamiento de tus datos',
  gateDescription:
    'Para seguir usando Lancelot necesitamos tu autorización expresa, como lo exige la Ley 1581 de 2012. Puedes leer la política completa antes de decidir.',
  gateSummary: [
    'El club trata tus datos para el seguimiento deportivo, el control de carga y la prevención de lesiones.',
    'Los datos de salud solo los ven los roles autorizados y cada acceso queda registrado.',
    'Puedes conocer, actualizar, rectificar o pedir la supresión de tus datos cuando quieras.',
  ],
  accept: 'Acepto y continúo',
  accepting: 'Guardando…',
  signOut: 'Cerrar sesión',
  accepted: 'Tu autorización quedó registrada.',
  acceptedOn: (date: string) => `Autorizaste el tratamiento de tus datos el ${date}.`,
} as const
