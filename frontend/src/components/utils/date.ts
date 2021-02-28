const months = [
  'Jan',
  'Feb',
  'March',
  'April',
  'May',
  'June',
  'July',
  'Aug',
  'Sept',
  'Oct',
  'Nov',
  'Dec',
];

export default function date_to_string(date: Date): string {
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
};