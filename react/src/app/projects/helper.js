const projectTypes = [
  'web',
  'image',
]
export const projectTypeOptions = [
  {
    label: 'Web application',
    value:  projectTypes[0],
  },
  {
    label: 'Image (mobile or misc projects)',
    value: projectTypes[1],
  }
];

export const isWebProject = project => project.type === projectTypes[0];
export const isImageProject = project => project.type === projectTypes[1];