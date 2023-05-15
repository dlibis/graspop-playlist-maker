/* eslint-disable arrow-body-style */
import Link from 'next/link';

type Props = { displayName: string; handleLogOut: () => void; loggedIn: boolean };

export const LoginButton: React.FC<Props> = ({ displayName, handleLogOut, loggedIn }) => {
  if (!loggedIn) {
    return (
      <Link href="/api/auth">
        <button
          type="button"
          className="rounded-full btn btn-sm md:btn-md bg-success text-white p-2 h-full"
        >
          <p className="text-xs md:text-base">Please login</p>
        </button>
      </Link>
    );
  }
  return (
    <div>
      <div className="dropdown dropdown-end">
        <button type="button" className="btn bg-success text-xs md:text-md text-white m-1">
          Hello {displayName}
        </button>
        <ul
          // tabIndex={0}
          className="dropdown-content menu p-2 shadow bg-gray-900 rounded-box w-52"
        >
          <li>
            <button className="btn btn-link no-underline" type="button" onClick={handleLogOut}>
              Logout
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
};
