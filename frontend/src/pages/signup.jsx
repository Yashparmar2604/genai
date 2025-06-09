import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function SignupPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
    skills: []
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const validateForm = () => {
    if (!form.name.trim()) {
      throw new Error("Name is required");
    }
    if (!form.email.trim()) {
      throw new Error("Email is required");
    }
    if (form.password.length < 6) {
      throw new Error("Password must be at least 6 characters");
    }
    if (form.role === "moderator" && (!form.skills.length || form.skills[0] === "")) {
      throw new Error("Skills are required for moderator role");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name === "skills" ? value.split(",").map(s => s.trim()) : value
    }));
    setError("");
  };

const handleSignup = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError("");

  try {
    validateForm();

    // Create request body based on role
    const requestBody = {
      name: form.name.trim(),
      email: form.email.trim(),
      password: form.password,
      role: form.role
    };

    // Only include skills if role is moderator
    if (form.role === "moderator") {
      requestBody.skills = form.skills;
    }

    const res = await fetch(
      `${import.meta.env.VITE_SERVER_URL}/auth/signup`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Signup failed");
    }

    // Store user data and redirect
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    navigate("/");
  } catch (err) {
    setError(err.message);
    console.error("Signup error:", err);
  } finally {
    setLoading(false);
  }
};

  const renderField = ({ name, label, type = "text", placeholder, required = true, minLength }) => (
    <div className="form-control">
      <label className="label">
        <span className="label-text font-medium">{label}</span>
      </label>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        className="input input-bordered input-md w-full"
        value={form[name]}
        onChange={handleChange}
        required={required}
        minLength={minLength}
      />
      {name === "password" && (
        <label className="label">
          <span className="label-text-alt">Must be at least 6 characters</span>
        </label>
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="card w-full max-w-md shadow-2xl bg-base-100 my-8">
        <div className="card-body space-y-4">
          {/* Header */}
          <div className="text-center mb-4">
            <h2 className="text-3xl font-bold">Create Account</h2>
            <p className="text-sm text-base-content/70 mt-1">
              Join our support ticket platform
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="alert alert-error shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span className="text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-6">
            {/* Form Fields */}
            {renderField({
              name: "name",
              label: "Full Name",
              placeholder: "John Doe"
            })}

            {renderField({
              name: "email",
              label: "Email",
              type: "email",
              placeholder: "your.email@example.com"
            })}

            {renderField({
              name: "password",
              label: "Password",
              type: "password",
              placeholder: "••••••••",
              minLength: 6
            })}

            {/* Role Selection */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Account Type</span>
              </label>
              <select
                name="role"
                className="select select-bordered w-full"
                value={form.role}
                onChange={handleChange}
                required
              >
                <option value="user">Regular User</option>
                <option value="moderator">Support Moderator</option>
                <option value="admin">Admin User</option>
              </select>
            </div>

            {/* Conditional Skills Field */}
            {form.role === "moderator" && (
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Technical Skills</span>
                  <span className="label-text-alt text-warning">Required</span>
                </label>
                <input
                  type="text"
                  name="skills"
                  placeholder="React, Node.js, MongoDB..."
                  className="input input-bordered input-md w-full"
                  value={form.skills.join(", ")}
                  onChange={handleChange}
                />
                <label className="label">
                  <span className="label-text-alt text-info">Enter skills separated by commas</span>
                </label>
              </div>
            )}

            {/* Submit Button */}
            <div className="form-control mt-6">
              <button
                type="submit"
                className="btn btn-primary w-full"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <span className="loading loading-spinner loading-sm"></span>
                    <span>Creating account...</span>
                  </div>
                ) : (
                  "Create Account"
                )}
              </button>
            </div>

            {/* Login Link */}
            <div className="text-center text-sm">
              Already have an account?{" "}
              <Link to="/login" className="link link-primary">
                Log in
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}