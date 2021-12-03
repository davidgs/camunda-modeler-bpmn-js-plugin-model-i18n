import React, { useState } from 'react';
import Form from 'react-bootstrap/Form';
import Dropdown from 'react-bootstrap/Dropdown';
import FlagIconFactory from 'react-flag-icon-css';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function CountryDrop() {
  const [countries] = useState([
    { title: 'Afrikaans', code: 'af', flag: './resources/flags/af.svg'},
    { title: 'Irish', code: 'ga' , flag: './resources/flags/ga.svg'},
    { title: 'Albanian', code: 'sq' , flag: './resources/flags/sq.svg'},
    { title: 'Italian', code: 'it' , flag: './resources/flags/it.svg'},
    { title: 'Arabic', code: 'ar' , flag: './resources/flags/ar.svg'},
    { title: 'Japanese', code: 'ja' , flag: './resources/flags/ja.svg'},
    { title: 'Azerbaijani', code: 'az' , flag: './resources/flags/az.svg'},
    { title: 'Kannada', code: 'kn' , flag: './resources/flags/kn.svg'},
    { title: 'Basque', code: 'eu' , flag: './resources/flags/eu.svg'},
    { title: 'Korean', code: 'ko' , flag: './resources/flags/ko.svg'},
    { title: 'Bengali', code: 'bn' , flag: './resources/flags/bn.svg'},
    { title: 'Latin', code: 'la' , flag: './resources/flags/la.svg'},
    { title: 'Belarusian', code: 'be' , flag: './resources/flags/be.svg'},
    { title: 'Latvian', code: 'lv' , flag: './resources/flags/lv.svg'},
    { title: 'Bulgarian', code: 'bg' , flag: './resources/flags/bg.svg'},
    { title: 'Lithuanian', code: 'lt' , flag: './resources/flags/lt.svg'},
    { title: 'Catalan', code: 'ca' , flag: './resources/flags/ca.svg'},
    { title: 'Macedonian', code: 'mk' , flag: './resources/flags/mk.svg'},
    { title: 'Chinese Simplified', code: 'zh-CN' , flag: './resources/flags/CN.svg'},
    { title: 'Malay', code: 'ms' , flag: './resources/flags/ms.svg'},
    { title: 'Chinese Traditional', code: 'zh-TW' , flag: './resources/flags/TW.svg'},
    { title: 'Maltese', code: 'mt' , flag: './resources/flags/mt.svg'},
    { title: 'Croatian', code: 'hr' , flag: './resources/flags/hr.svg'},
    { title: 'Norwegian', code: 'no' , flag: './resources/flags/no.svg'},
    { title: 'Czech', code: 'cs' , flag: './resources/flags/cs.svg'},
    { title: 'Persian', code: 'fa' , flag: './resources/flags/fa.svg'},
    { title: 'Danish', code: 'da' , flag: './resources/flags/da.svg'},
    { title: 'Polish', code: 'pl' , flag: './resources/flags/pl.svg'},
    { title: 'Dutch', code: 'nl' , flag: './resources/flags/nl.svg'},
    { title: 'Portuguese', code: 'pt' , flag: './resources/flags/pt.svg'},
    { title: 'English', code: 'en' , flag: './resources/flags/en.svg'},
    { title: 'Romanian', code: 'ro' , flag: './resources/flags/ro.svg'},
    { title: 'Esperanto', code: 'eo' , flag: './resources/flags/eo.svg'},
    { title: 'Russian', code: 'ru' , flag: './resources/flags/ru.svg'},
    { title: 'Estonian', code: 'et' , flag: './resources/flags/et.svg'},
    { title: 'Serbian', code: 'sr' , flag: './resources/flags/sr.svg'},
    { title: 'Filipino', code: 'tl' , flag: './resources/flags/tl.svg'},
    { title: 'Slovak', code: 'sk' , flag: './resources/flags/sk.svg'},
    { title: 'Finnish', code: 'fi' , flag: './resources/flags/fi.svg'},
    { title: 'Slovenian', code: 'sl' , flag: './resources/flags/sl.svg'},
    { title: 'French', code: 'fr' , flag: './resources/flags/fr.svg'},
    { title: 'Spanish', code: 'es' , flag: './resources/flags/es.svg'},
    { title: 'Galician', code: 'gl' , flag: './resources/flags/gl.svg'},
    { title: 'Swahili', code: 'sw' , flag: './resources/flags/sw.svg'},
    { title: 'Georgian', code: 'ka' , flag: './resources/flags/ka.svg'},
    { title: 'Swedish', code: 'sv' , flag: './resources/flags/sv.svg'},
    { title: 'German', code: 'de' , flag: './resources/flags/de.svg'},
    { title: 'Tamil', code: 'ta' , flag: './resources/flags/ta.svg'},
    { title: 'Greek', code: 'el' , flag: './resources/flags/el.svg'},
    { title: 'Telugu', code: 'te' , flag: './resources/flags/te.svg'},
    { title: 'Gujarati', code: 'gu' , flag: './resources/flags/gu.svg'},
    { title: 'Thai', code: 'th' , flag: './resources/flags/th.svg'},
    { title: 'Haitian Creole', code: 'ht' , flag: './resources/flags/ht.svg'},
    { title: 'Turkish', code: 'tr' , flag: './resources/flags/tr.svg'},
    { title: 'Hebrew', code: 'iw' , flag: './resources/flags/iw.svg'},
    { title: 'Ukrainian', code: 'uk' , flag: './resources/flags/uk.svg'},
    { title: 'Hindi', code: 'hi' , flag: './resources/flags/hi.svg'},
    { title: 'Urdu', code: 'ur' , flag: './resources/flags/ur.svg'},
    { title: 'Hungarian', code: 'hu' , flag: './resources/flags/hu.svg'},
    { title: 'Vietnamese', code: 'vi' , flag: './resources/flags/vi.svg'},
    { title: 'Icelandic', code: 'is' , flag: './resources/flags/is.svg'},
    { title: 'Welsh', code: 'cy' , flag: './resources/flags/cy.svg'},
    { title: 'Indonesian', code: 'id' , flag: './resources/flags/id.svg'},
    { title: 'Yiddish', code: 'yi' , flag: './resources/flags/yi.svg'}
  ]);
  const [toggleContents, setToggleContents] = useState("Select a language");
  const [selectedCountry, setSelectedCountry] = useState();

  const FlagIcon = FlagIconFactory(React, { useCssModules: false })

  return (
    <div className="Toggle">
      <Form>
        <Dropdown
          onSelect={eventKey => {
            const { code, title } = countries.find(({ code }) => eventKey === code);

            setSelectedCountry(eventKey);
            setToggleContents(<><FlagIcon code={code} /> {title}</>);
          }}
        >
          <Dropdown.Toggle variant="primary" id="dropdown-flags" className="text-left" >
            {toggleContents}
          </Dropdown.Toggle>

          <Dropdown.Menu>
            {countries.map(({ code, title }) => (
              <Dropdown.Item key={code} eventKey={code}><FlagIcon code={code} /> {title}</Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown>
      </Form>
    </div>
  );
}
