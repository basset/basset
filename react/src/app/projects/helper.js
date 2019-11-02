export const PROJECT_TYPES = {
  WEB: 'web',
  IMAGE: 'image',
};

const projectTypes = [
  'web',
  'image',
]
export const projectTypeOptions = [
  {
    label: 'Web application',
    value:  PROJECT_TYPES.WEB,
  },
  {
    label: 'Image (mobile or misc projects)',
    value: PROJECT_TYPES.IMAGE,
  }
];

export const isWebProject = project => project.type === PROJECT_TYPES.WEB;
export const isImageProject = project => project.type === PROJECT_TYPES.IMAGE;