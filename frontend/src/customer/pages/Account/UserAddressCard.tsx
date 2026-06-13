import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Phone, Edit2, Trash2, X, Save, Loader2, Home } from "lucide-react";
import type { Address } from "../../../types/userTypes";
import { useAppDispatch } from "../../../Redux Toolkit/Store";
import { updateAddress, deleteAddress } from "../../../Redux Toolkit/Customer/UserSlice";
import { useTheme } from "../../../routes/CustomerRoutes";

const UserAddressCard = ({ item }: { item: Address }) => {
  const { isDark } = useTheme();
  const dispatch = useAppDispatch();
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const [form, setForm] = useState({
    name:     item.name     || "",
    address:  item.address  || "",
    locality: item.locality || "",
    city:     item.city     || "",
    state:    item.state    || "",
    pinCode:  item.pinCode  || "",
    mobile:   item.mobile   || "",
  });

  const handleSave = async () => {
    setLoading(true);
    await dispatch(updateAddress({ id: item._id || "", data: form }));
    setLoading(false);
    setEditMode(false);
  };

  const handleDelete = async () => {
    setLoading(true);
    await dispatch(deleteAddress(item._id || ""));
    setLoading(false);
    setShowDelete(false);
  };

  const inputStyle = {
    background: isDark ? "rgba(255,255,255,0.04)" : "white",
    border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid #e5e7eb",
    color: isDark ? "white" : "#111",
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={`p-5 rounded-2xl relative ${
        isDark ? "bg-white/3 border border-white/8" : "bg-white border border-gray-100 shadow-sm"
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/15 flex items-center justify-center">
            <Home size={15} className="text-emerald-400" />
          </div>
          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
            isDark ? "bg-white/10 text-white/70" : "bg-gray-100 text-gray-600"
          }`}>HOME</span>
        </div>

        {!editMode && (
          <div className="flex gap-1">
            <button onClick={() => setEditMode(true)}
              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                isDark ? "hover:bg-white/10" : "hover:bg-gray-100"
              }`}>
              <Edit2 size={12} className="text-purple-400" />
            </button>
            <button onClick={() => setShowDelete(true)}
              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                isDark ? "hover:bg-red-500/10" : "hover:bg-red-50"
              }`}>
              <Trash2 size={12} className="text-red-400" />
            </button>
          </div>
        )}
      </div>

      {editMode ? (
        <div className="space-y-2">
          {[
            { name: "name",     placeholder: "Full Name" },
            { name: "address",  placeholder: "Street Address" },
            { name: "locality", placeholder: "Locality" },
          ].map((f) => (
            <input key={f.name}
              value={form[f.name as keyof typeof form]}
              onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
              placeholder={f.placeholder}
              className="w-full px-3 py-2 rounded-lg text-sm outline-none"
              style={inputStyle}
            />
          ))}
          <div className="grid grid-cols-3 gap-2">
            <input value={form.city} onChange={(e) => setForm({...form, city: e.target.value})}
              placeholder="City" className="px-3 py-2 rounded-lg text-sm outline-none" style={inputStyle} />
            <input value={form.state} onChange={(e) => setForm({...form, state: e.target.value})}
              placeholder="State" className="px-3 py-2 rounded-lg text-sm outline-none" style={inputStyle} />
            <input value={form.pinCode} onChange={(e) => setForm({...form, pinCode: e.target.value})}
              placeholder="PIN" className="px-3 py-2 rounded-lg text-sm outline-none" style={inputStyle} />
          </div>
          <input value={form.mobile} onChange={(e) => setForm({...form, mobile: e.target.value})}
            placeholder="Mobile" className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={inputStyle} />

          <div className="flex gap-2 pt-2">
            <button onClick={() => setEditMode(false)}
              className={`flex-1 py-2 rounded-lg text-xs font-bold ${
                isDark ? "bg-white/5 text-white/70" : "bg-gray-100 text-gray-700"
              }`}>
              Cancel
            </button>
            <button onClick={handleSave} disabled={loading}
              className="flex-[2] py-2 rounded-lg text-xs font-bold text-white flex items-center justify-center gap-1.5"
              style={{ background: "linear-gradient(135deg, #10b981, #14b8a6)" }}>
              {loading ? <Loader2 size={11} className="animate-spin" /> : <Save size={11} />}
              Save Changes
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <h3 className={`font-bold text-sm ${isDark ? "text-white" : "text-gray-900"}`}>{item.name}</h3>
          <p className={`text-xs leading-relaxed ${isDark ? "text-white/60" : "text-gray-600"}`}>
            {item.address}, {item.locality},<br />{item.city}, {item.state} - {item.pinCode}
          </p>
          <div className="flex items-center gap-1.5 pt-2">
            <Phone size={11} className={isDark ? "text-white/40" : "text-gray-400"} />
            <span className={`text-xs font-medium ${isDark ? "text-white/70" : "text-gray-700"}`}>{item.mobile}</span>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      <AnimatePresence>
        {showDelete && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 rounded-2xl flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(4px)" }}
          >
            <div className="text-center">
              <p className="text-white text-sm font-bold mb-3">Delete this address?</p>
              <div className="flex gap-2 justify-center">
                <button onClick={() => setShowDelete(false)}
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-white/10 text-white">
                  Cancel
                </button>
                <button onClick={handleDelete} disabled={loading}
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-red-500 text-white flex items-center gap-1">
                  {loading && <Loader2 size={11} className="animate-spin" />}
                  Delete
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default UserAddressCard;