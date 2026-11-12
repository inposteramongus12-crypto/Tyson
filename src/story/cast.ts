import type {Base} from '../kit/actions';

/* Characters of «Что если ты станешь Майком Тайсоном?». Key = id used in <Actor who="..."/>; `sp` = speaker code
   in lines.json (default: the id in upper case). Every body colour has its own hue, so nobody merges with another
   character or with the dark-blue / warm-light backgrounds (checked on the Cast sheet, both backgrounds).
   Hero: pass fist="white" (clenched) or fist="skin" (relaxed) in the shots that show knuckles.
   Voiceless extras (Gera, rival, referee, Douglas, entourage) have no `sp`: they talk only through bubbles. */
export type CastMember = Base & {sp?: string};

export const CAST: Record<string, CastMember> = {
	// Даня, герой: жёлтая толстовка
	hero: {sp: 'HERO', color: '#f2b21c', outfit: 'hoodie', hair: 'short', rim: '#fff0cc', rimW: 2.4, shoe: '#f2f2f2'},
	// Лёха: синяя толстовка, рыжие вихры, очки (блокнот «ТЕОРИИ»)
	leha: {sp: 'LEHA', color: '#2f6fd8', outfit: 'hoodie', hair: 'spiky', hairColor: '#c9672a', acc: ['glasses'], rim: '#e6f0ff', rimW: 2.4, shoe: '#f2f2f2'},
	// Семён Ильич: старик, клетчатая кепка тёмно-красная, седые усы, серо-стальная куртка
	coach: {sp: 'COACH', color: '#6b7f8e', outfit: 'coat', hair: 'cap', hairColor: '#8c2a2a', acc: ['mustache'], age: 1, rim: '#eef4ff', rimW: 2.4, shoe: '#2b2f3a'},
	// мама: фиолетовый халат, каре
	mama: {sp: 'MAMA', color: '#8e5cd9', outfit: 'gown', hair: 'bob', rim: '#f0e4ff', rimW: 2.4, shoe: '#2c2540'},
	// Гера из третьего подъезда: коричневая футболка, бритая голова
	gera: {color: '#a9743f', outfit: 'tee', hair: 'none', rim: '#ffe6c8', rimW: 2.4, shoe: '#1d1d22'},
	// соперник в первых боях: оранжевая майка, хвост
	rival: {color: '#ee6a2c', outfit: 'tee', hair: 'ponytail', hairColor: '#2b2f3a', rim: '#ffe0cc', rimW: 2.4, shoe: '#f2f2f2'},
	// рефери: светлая рубашка, красный галстук (outfit suit), тёмная окантовка, чтобы читался и на светлом фоне
	referee: {color: '#e6e9ef', outfit: 'suit', hair: 'short', rim: '#2b2f3a', rimW: 2.6, shoe: '#111'},
	// Дуглас, соперник в Токио: бирюзовый, длинный и спокойный (в кадре рисуй чуть выше героя: s +0.1)
	douglas: {color: '#17b3c4', outfit: 'tee', hair: 'none', rim: '#dffaff', rimW: 2.4, shoe: '#f2f2f2'},
	// свита: три костюма разного цвета, у каждого свой знак
	svita1: {color: '#e0449b', outfit: 'suit', hair: 'bun', hairColor: '#4a3426', acc: ['glasses'], rim: '#ffe0f0', rimW: 2.4, shoe: '#2b1d24'},
	svita2: {color: '#8c1d40', outfit: 'suit', hair: 'cap', hairColor: '#e8e8ee', acc: ['mustache'], rim: '#ffd0dc', rimW: 2.4, shoe: '#111'},
	svita3: {color: '#2aa876', outfit: 'suit', hair: 'spiky', hairColor: '#5a3a22', rim: '#e0fff0', rimW: 2.4, shoe: '#111'},
};
