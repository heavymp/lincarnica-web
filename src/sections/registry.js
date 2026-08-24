import KontaktPanel from './KontaktPanel.jsx';
import ObavijestiPanel from './ObavijestiPanel.jsx';

export const sections = [
  {
    id: 'obavijesti',
    labelKey: 'label_obavijesti',
    fallbackLabel: 'Obavijesti',
    Panel: ObavijestiPanel
  },
  {
    id: 'kontakt',
    labelKey: 'label_kontakt',
    fallbackLabel: 'Kontakt',
    Panel: KontaktPanel
  }
];
