// Simple database service using localStorage
// In a real app, this would connect to a backend database

export interface User {
  id: string;
  profile: import("@/context/AppContext").UserProfile;
  createdAt: number;
  lastUpdated: number;
}

class DatabaseService {
  private readonly USERS_KEY = 'alliswell_users';
  private readonly VOLUNTEERS_KEY = 'alliswell_volunteers';

  // Save user profile to database
  async saveUserProfile(userId: string, profile: import("@/context/AppContext").UserProfile): Promise<void> {
    const users = this.getUsers();
    const existingUserIndex = users.findIndex(u => u.id === userId);

    const userData: User = {
      id: userId,
      profile,
      createdAt: existingUserIndex >= 0 ? users[existingUserIndex].createdAt : Date.now(),
      lastUpdated: Date.now(),
    };

    if (existingUserIndex >= 0) {
      users[existingUserIndex] = userData;
    } else {
      users.push(userData);
    }

    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));

    // If user is a volunteer, add to volunteers list
    if (profile.isVolunteer) {
      this.addVolunteer(userData);
    } else {
      this.removeVolunteer(userId);
    }
  }

  // Get user profile from database
  async getUserProfile(userId: string): Promise<import("@/context/AppContext").UserProfile | null> {
    const users = this.getUsers();
    const user = users.find(u => u.id === userId);
    return user ? user.profile : null;
  }

  // Get all volunteers
  async getVolunteers(): Promise<User[]> {
    const volunteers = localStorage.getItem(this.VOLUNTEERS_KEY);
    return volunteers ? JSON.parse(volunteers) : [];
  }

  // Get nearby volunteers (mock implementation)
  async getNearbyVolunteers(latitude: number, longitude: number, radiusKm: number = 10): Promise<User[]> {
    const volunteers = await this.getVolunteers();

    // Mock distance calculation - in real app, use proper geospatial queries
    return volunteers.filter(volunteer => {
      if (!volunteer.profile.location) return false;

      const distance = this.calculateDistance(
        latitude,
        longitude,
        volunteer.profile.location.latitude,
        volunteer.profile.location.longitude
      );

      return distance <= radiusKm;
    });
  }

  private getUsers(): User[] {
    const users = localStorage.getItem(this.USERS_KEY);
    return users ? JSON.parse(users) : [];
  }

  private addVolunteer(user: User): void {
    const volunteers = this.getVolunteers();
    const existingIndex = volunteers.findIndex(v => v.id === user.id);

    if (existingIndex >= 0) {
      volunteers[existingIndex] = user;
    } else {
      volunteers.push(user);
    }

    localStorage.setItem(this.VOLUNTEERS_KEY, JSON.stringify(volunteers));
  }

  private removeVolunteer(userId: string): void {
    const volunteers = this.getVolunteers().filter(v => v.id !== userId);
    localStorage.setItem(this.VOLUNTEERS_KEY, JSON.stringify(volunteers));
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}

export const databaseService = new DatabaseService();