import { authService } from "../services/authService.js";
import { setState, getState, clearSubscriptions } from "../../utils/storage.js";
import { validateEmail, validateGraduationYear, validatePassword, validateRequired } from "../../utils/validation.js";
import { uploadFile } from "../../frontend/ui/imageUpload.js";
import { supabase } from "../../supabase.js";

function buildFallbackProfile(sessionUser) {
  const metadata = sessionUser?.user_metadata || {};
  return {
    id: sessionUser.id,
    full_name: metadata.full_name || sessionUser.email?.split("@")[0] || "Alumni Member",
    email: sessionUser.email || "",
    department: metadata.department || "Alumni",
    graduation_year: Number(metadata.graduation_year) || new Date().getFullYear(),
    profile_image: metadata.profile_image || "",
    bio: metadata.bio || "",
    location: metadata.location || "",
    company: metadata.company || "",
  };
}

export const authController = {
  async initializeSession() {
    const session = await authService.getSession();
    setState({ session });
    if (session?.user) {
      await this.hydrateCurrentUser();
    }
  },

  onAuthChange(callback) {
    return supabase.auth.onAuthStateChange(async (_event, session) => {
      setState({ session });
      if (!session) {
        clearSubscriptions();
      }
      await callback(session);
    });
  },

  async hydrateCurrentUser() {
    const { session } = getState();
    if (!session?.user) {
      setState({ currentUser: null });
      return null;
    }

    let currentUser = await authService.getUserProfile(session.user.id);

    if (!currentUser) {
      currentUser = await authService.createUserProfile(buildFallbackProfile(session.user));
    }

    setState({ currentUser });
    return currentUser;
  },

  async login({ email, password }) {
    validateEmail(email);
    validatePassword(password);
    const { session } = await authService.login(email, password);
    setState({ session });
    await this.hydrateCurrentUser();
  },

  async prepareSignupPayload(form) {
    const formData = new FormData(form);
    const full_name = formData.get("full_name");
    const email = formData.get("email");
    const password = formData.get("password");
    const department = formData.get("department");
    const graduation_year = formData.get("graduation_year");
    const bio = formData.get("bio");
    const location = formData.get("location");
    const company = formData.get("company");
    const profileFile = formData.get("profile_image");

    validateRequired(full_name, "Full name");
    validateEmail(email);
    validatePassword(password);
    validateRequired(department, "Department");
    validateGraduationYear(graduation_year);

    return {
      email,
      password,
      full_name,
      department,
      graduation_year: Number(graduation_year),
      bio,
      location,
      company,
      profileFile: profileFile?.size ? profileFile : null,
    };
  },

  async signup(payload) {
    const signupData = await authService.signup(payload);
    const authUser = signupData.user;
    if (!authUser?.id) {
      throw new Error("Signup succeeded but user profile could not be created.");
    }

    const session = signupData.session || (await authService.getSession());
    if (!session?.user) {
      throw new Error("Signup succeeded, but no active session was created. Please verify your email and then log in.");
    }

    setState({ session });

    let profile_image = "";
    if (payload.profileFile) {
      profile_image = await uploadFile(payload.profileFile, "profiles");
    }

    await authService.createUserProfile({
      id: authUser.id,
      full_name: payload.full_name,
      email: payload.email,
      department: payload.department,
      graduation_year: payload.graduation_year,
      profile_image,
      bio: payload.bio || "",
      location: payload.location || "",
      company: payload.company || "",
    });

    await this.hydrateCurrentUser();
  },

  async logout() {
    await authService.logout();
    setState({ session: null, currentUser: null, feed: null, profile: null, directory: null, messages: null });
  },
};
