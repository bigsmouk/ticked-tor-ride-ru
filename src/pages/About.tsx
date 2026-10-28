import { Link } from 'react-router-dom';
import { useLanguage } from '@/i18n/language';

export default function About() {
  const { language } = useLanguage();
  const en = language === 'en';
  return (
    <main className="min-h-screen bg-amber-50 px-4 py-10 text-amber-950">
      <article className="mx-auto max-w-3xl space-y-6 rounded-2xl border border-amber-700/30 bg-white p-6 shadow-xl sm:p-10">
        <nav className="flex flex-wrap gap-4 text-sm text-amber-800 underline" aria-label={en ? 'Navigation' : 'Навигация'}>
          <Link to="/">{en ? 'Home' : 'Главная'}</Link>
          <Link to="/rules">{en ? 'Game rules' : 'Правила игры'}</Link>
          <Link to="/privacy">{en ? 'Privacy' : 'Конфиденциальность'}</Link>
        </nav>
        <span className="inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-bold uppercase tracking-widest text-amber-900">{en ? 'Independent project · beta' : 'Независимый проект · beta'}</span>
        <h1 className="text-3xl font-extrabold sm:text-4xl">{en ? 'About the Creator and the Project' : 'Об авторе и проекте'}</h1>
        {en ? <>
          <p>Hi! My name is <strong>Timur</strong>.</p>
          <p>I created this browser-based railway strategy game as a personal project. During development, I used artificial intelligence tools to help write and improve code, design the interface, and implement gameplay features.</p>
          <h2 className="text-xl font-bold">What Inspired Me</h2>
          <p>My inspiration came from <strong>Ticket to Ride: Europe</strong>, a board game designed by <strong>Alan R. Moon</strong> and published by <strong>Days of Wonder</strong>.</p>
          <p>I wanted to explore the idea of creating a browser-based railway strategy game that people could play with friends or independently against a computer opponent.</p>
          <h2 className="text-xl font-bold">Independent Project</h2>
          <p>This website is an independent, unofficial fan-made project.</p>
          <p>It is not an official digital version of Ticket to Ride and is not affiliated with, endorsed, or sponsored by Days of Wonder, Asmodee, or the original game's creators.</p>
          <p>Ticket to Ride and its associated trademarks belong to their respective owners.</p>
          <p>References to the original game are provided solely to acknowledge the source of inspiration and do not imply any official relationship with the rights holders.</p>
          <h2 className="text-xl font-bold">Current Development Status</h2>
          <p>The game is currently in <strong>beta</strong>. I am continuing to improve gameplay mechanics, refine the interface, and fix bugs.</p>
          <p>Thank you to everyone who tries the game and shares feedback!</p>
        </> : <>
          <p>Привет! Меня зовут <strong>Тимур</strong>.</p>
          <p>Я создал эту браузерную игру про железные дороги как личный проект. В процессе разработки я использовал инструменты искусственного интеллекта, которые помогали мне писать и улучшать код, разрабатывать интерфейс и реализовывать игровые механики.</p>
          <h2 className="text-xl font-bold">Откуда появилась идея</h2>
          <p>Меня вдохновила настольная игра <strong>Ticket to Ride: Europe</strong>, разработанная <strong>Аланом Р. Муном (Alan R. Moon)</strong> и выпущенная издательством <strong>Days of Wonder</strong>.</p>
          <p>Мне захотелось попробовать создать браузерную железнодорожную стратегию, в которую можно играть с друзьями или самостоятельно против компьютерного соперника.</p>
          <h2 className="text-xl font-bold">Независимый проект</h2>
          <p>Этот сайт представляет собой независимый неофициальный фанатский проект.</p>
          <p>Он не является официальной цифровой версией Ticket to Ride, не связан с Days of Wonder, Asmodee или создателями оригинальной игры, не одобрен и не спонсируется ими.</p>
          <p>Название Ticket to Ride и связанные с ним товарные знаки принадлежат соответствующим правообладателям.</p>
          <p>Упоминание оригинальной игры используется для указания на источник вдохновения и не означает наличия официальных отношений с правообладателями.</p>
          <h2 className="text-xl font-bold">Текущая стадия разработки</h2>
          <p>Игра находится на стадии <strong>beta</strong>. Я продолжаю работать над игровыми механиками, интерфейсом и исправлением ошибок.</p>
          <p>Спасибо всем, кто пробует игру и делится своими впечатлениями!</p>
        </>}
        <Link to="/" className="inline-flex rounded-lg bg-amber-800 px-5 py-3 font-semibold text-white hover:bg-amber-900">{en ? '← Back to the game' : '← Вернуться к игре'}</Link>
      </article>
    </main>
  );
}
