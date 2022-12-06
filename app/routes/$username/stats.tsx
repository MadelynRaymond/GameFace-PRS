import { NavLink, Outlet } from "@remix-run/react";

export default function Stats() {
  return (
    <>
      <div className="stats-menu">
        <div className="stats-menu__items">
          {["Overall", "Speed", "Shooting", "Dribbling", "Passing", "Strength", "Jumping"].map((category, i) => <NavLink className={({isActive}) => isActive ? 'stats-menu__item-selected' : undefined} key={i} to={category}>{category}</NavLink>)}
        </div>
      </div>
      <Outlet/>
    </>
  )
}