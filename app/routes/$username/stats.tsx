import { NavLink, Outlet } from "@remix-run/react";

export default function Stats() {
  return (
    <>
      <div className="stats-menu">
        <p className="stats-menu__header">Performance Stats</p>
        <p className="stats-menu__athlete-name">Athlete: Danielle Robbins</p>
        <div className="stats-menu__items">
          {["Overall", "Speed", "Shooting", "Dribbling", "Passing", "Strength", "Jumping"].map((category, i) => <NavLink className={({isActive}) => isActive ? 'stats-menu__item-selected' : undefined} key={i} to={category}>{category}</NavLink>)}
        </div>
      </div>
      <Outlet/>
    </>
  )
}