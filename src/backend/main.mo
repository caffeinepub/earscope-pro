import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Int "mo:core/Int";
import Text "mo:core/Text";
import Map "mo:core/Map";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";

actor {
  // Include prefabricated components (state initialized during actor lifecycle)
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  // Enums and types
  public type SessionType = {
    #routine;
    #followUp;
    #emergency;
  };

  public type Eye = {
    #left;
    #right;
  };

  public type Patient = {
    id : Text;
    name : Text;
    age : Nat;
    doctor : Text;
  };

  public type Session = {
    id : Text;
    patientId : Text;
    sessionType : SessionType;
    eye : Eye;
    timestamp : Time.Time;
  };

  public type Capture = {
    id : Text;
    sessionId : Text;
    image : Storage.ExternalBlob;
    thumbnail : Storage.ExternalBlob;
    qualityScore : ?Nat;
    timestamp : Time.Time;
  };

  public type UserProfile = {
    name : Text;
  };

  module Capture {
    public func compare(capture1 : Capture, capture2 : Capture) : Order.Order {
      switch (Int.compare(capture1.timestamp, capture2.timestamp)) {
        case (#equal) { Text.compare(capture1.id, capture2.id) };
        case (order) { order };
      };
    };
  };

  // Storage
  let patients = Map.empty<Text, Patient>();
  let sessions = Map.empty<Text, Session>();
  let captures = Map.empty<Text, Capture>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Patient management
  public shared ({ caller }) func addPatient(id : Text, name : Text, age : Nat, doctor : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add patients");
    };
    let patient : Patient = {
      id;
      name;
      age;
      doctor;
    };
    patients.add(id, patient);
  };

  public query ({ caller }) func getPatient(id : Text) : async ?Patient {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view patient data");
    };
    patients.get(id);
  };

  public query ({ caller }) func getAllPatients() : async [Patient] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view patient data");
    };
    patients.values().toArray();
  };

  // Session management
  public shared ({ caller }) func addSession(id : Text, patientId : Text, sessionType : SessionType, eye : Eye) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add sessions");
    };
    let session : Session = {
      id;
      patientId;
      sessionType;
      eye;
      timestamp = Time.now();
    };
    sessions.add(id, session);
  };

  public query ({ caller }) func getSession(id : Text) : async ?Session {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view session data");
    };
    sessions.get(id);
  };

  public query ({ caller }) func getAllSessions() : async [Session] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view session data");
    };
    sessions.values().toArray();
  };

  // Capture management
  public shared ({ caller }) func addCapture(id : Text, sessionId : Text, image : Storage.ExternalBlob, thumbnail : Storage.ExternalBlob) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add captures");
    };
    let capture : Capture = {
      id;
      sessionId;
      image;
      thumbnail;
      qualityScore = null;
      timestamp = Time.now();
    };
    captures.add(id, capture);
  };

  public query ({ caller }) func getCapture(id : Text) : async ?Capture {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view capture data");
    };
    captures.get(id);
  };

  public query ({ caller }) func getAllCaptures() : async [Capture] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view capture data");
    };
    captures.values().toArray().sort();
  };
};
