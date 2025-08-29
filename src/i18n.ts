import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import Backend from "i18next-http-backend";
import ICU from "i18next-icu";
import { initReactI18next } from "react-i18next";
import en from "@/translations/en.json" with { type: "json" };

import pl from "@/translations/pl.json" with { type: "json" };

// don't want to use this?
// have a look at the Quick start guide
// for passing in lng and translations on init

i18n
	// load translation using http -> see /public/locales (i.e. https://github.com/i18next/react-i18next/tree/master/example/react/public/locales)
	// learn more: https://github.com/i18next/i18next-http-backend
	// want your translations to be loaded from a professional CDN? => https://github.com/locize/react-tutorial#step-2---use-the-locize-cdn
	.use(Backend)
	// detect auth language
	// learn more: https://github.com/i18next/i18next-browser-languageDetector
	.use(LanguageDetector)
	// pass the i18n instance to react-i18next.
	.use(initReactI18next)
	.use(ICU)
	// init i18next
	// for all options read: https://www.i18next.com/overview/configuration-options
	.init({
		fallbackLng: "en",
		debug: true,
		resources: {
			en: {
				translation: en,
			},
			pl: {
				translation: pl,
			},
		},
		interpolation: {
			escapeValue: false, // not needed for React as it escapes by default
		},

		react: {
			bindI18n: "languageChanged loaded",
			bindI18nStore: "added removed",
			nsMode: "default",
		},
	});

export default i18n;
