import { useAppDispatch, useAppSelector } from '../hooks';
import { logout } from '../store/slices/authSlice';

export default function UserMenu() {
  const dispatch = useAppDispatch();
  const user = useAppSelector(s => s.auth.user);

  if (!user) return null;

  return (
    <div className="flex items-center gap-3">
      
        <div className="flex text-right mr-2 gap-3 item-end">
            <span className="text-gray-800 font-medium">{user.role.charAt(0).toUpperCase() + user.role.slice(1)} : </span>
          <span className="font-medium text-indigo-600">{user.username}</span>
          
        </div>
   

      <button
        onClick={() => dispatch(logout())}
        className="px-3 py-1 text-sm border rounded-md bg-white hover:bg-gray-100 shadow-sm hover:shadow-md"
        title="Logout"
      >
        Logout
      </button>
    </div>
  );
}