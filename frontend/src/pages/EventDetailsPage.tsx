import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { eventService } from "@/services/eventService";
import { participationService } from "@/services/participationService";
import { NgoEvent } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Calendar, Users, Star, Loader2, CheckCircle2, Navigation, Clock, Leaf, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

const EventDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [event, setEvent] = useState<NgoEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [participationStatus, setParticipationStatus] = useState<string>("NOT_REGISTERED");
  const [actionLoading, setActionLoading] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);

  const isAttendanceWindowOpen = (event: NgoEvent) => {
    const eventDate = new Date(event.date);
    if (Number.isNaN(eventDate.getTime())) return false;

    const startParts = event.startTime?.split(":").map(Number);
    const endParts = event.endTime?.split(":").map(Number);

    if (startParts?.length === 2) {
      eventDate.setHours(startParts[0], startParts[1], 0, 0);
    } else {
      eventDate.setHours(0, 0, 0, 0);
    }

    const now = new Date();
    if (now < eventDate) return false;

    if (endParts?.length === 2) {
      const eventEnd = new Date(event.date);
      eventEnd.setHours(endParts[0], endParts[1], 0, 0);
      return now <= eventEnd;
    }

    return event.status === "ONGOING" || event.status === "COMPLETED" ? false : now >= eventDate;
  };

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        const evt = await eventService.getEventById(Number(id));
        setEvent(evt);
        if (user) {
          const status = await participationService.getParticipationStatus(Number(user.id), Number(id));
          setParticipationStatus(status.status);
        }
      } catch {
        toast({ title: "Event not found", variant: "destructive" });
        navigate("/events");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, user]);

  const handleJoin = async () => {
    if (!user || !event) return;
    setActionLoading(true);
    try {
      await participationService.joinEvent(Number(user.id), event.id);
      setParticipationStatus("REGISTERED");
      toast({ title: "Joined event! ✅", description: `You earned 10 Eco Points for registering.` });
    } catch (e: any) {
      toast({ title: "Join failed", description: e.response?.data?.error || "Try again", variant: "destructive" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!user || !event) return;
    setActionLoading(true);
    try {
      await participationService.cancelParticipation(Number(user.id), event.id);
      setParticipationStatus("CANCELLED");
      toast({ title: "Registration cancelled" });
    } catch (e: any) {
      toast({ title: "Cancel failed", description: e.response?.data?.error, variant: "destructive" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleGpsAttendance = () => {
    if (!user || !event) return;
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async pos => {
        try {
          const result = await participationService.verifyGpsAttendance(
            Number(user.id), event.id, pos.coords.latitude, pos.coords.longitude
          );
          setParticipationStatus("ATTENDED");
          toast({
            title: "✅ Attendance Verified!",
            description: `You were ${result.distanceMeters.toFixed(0)}m away. +${event.rewardPoints} Eco Points awarded!`,
          });
        } catch (e: any) {
          toast({ title: "Attendance failed", description: e.response?.data?.error || "You may be too far from the event.", variant: "destructive" });
        } finally {
          setGpsLoading(false);
        }
      },
      () => {
        setGpsLoading(false);
        toast({ title: "Location access required", description: "Please allow GPS to verify attendance.", variant: "destructive" });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-10 w-10 animate-spin text-green-600" /></div>;
  if (!event) return null;

  const isFull = event.currentParticipants >= event.maxParticipants;
  const fillPercent = Math.round((event.currentParticipants / event.maxParticipants) * 100);
  const canVerifyAttendance = participationStatus === "REGISTERED" && isAttendanceWindowOpen(event);
  const attendanceClosed = participationStatus === "REGISTERED" && !canVerifyAttendance;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-700 to-emerald-600 text-white">
        <div className="container mx-auto max-w-3xl px-4 pt-6 pb-10">
          <Button variant="ghost" size="sm" className="text-white/80 hover:text-white hover:bg-white/10 mb-4 -ml-2"
            onClick={() => navigate("/events")}>
            <ArrowLeft className="mr-1 h-4 w-4" /> Back to Events
          </Button>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex-1">
              <p className="text-xs text-green-200 font-medium mb-1">{event.eventType?.replace(/_/g, " ")}</p>
              <h1 className="text-2xl md:text-3xl font-extrabold">{event.title}</h1>
              {event.ngoName && <p className="text-sm text-green-200 mt-1">Organized by {event.ngoName}</p>}
            </div>
            <span className={cn("text-xs px-3 py-1 rounded-full font-bold",
              event.status === "UPCOMING" ? "bg-blue-400/20 text-blue-100 border border-blue-300" :
              event.status === "ONGOING" ? "bg-green-400/20 text-green-100 border border-green-300" : "bg-gray-400/20 text-gray-100")}>
              {event.status}
            </span>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-3xl px-4 -mt-6">
        {/* Info card */}
        <Card className="shadow-lg border-0 mb-5">
          <CardContent className="p-5 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Calendar, label: "Date", value: event.date },
              { icon: Clock, label: "Time", value: event.startTime ? `${event.startTime} – ${event.endTime || ""}` : "TBD" },
              { icon: MapPin, label: "Location", value: event.locationName },
              { icon: Star, label: "Eco Points", value: `${event.rewardPoints} pts` },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="text-center">
                <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center mx-auto mb-2">
                  <Icon className="h-4 w-4 text-green-600" />
                </div>
                <p className="text-xs text-gray-400">{label}</p>
                <p className="text-sm font-semibold text-gray-800 truncate">{value}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Participant progress */}
        <Card className="shadow-sm border-0 mb-5">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Users className="h-4 w-4 text-green-600" />
                <span>{event.currentParticipants} / {event.maxParticipants} volunteers</span>
              </div>
              <span className={cn("text-xs font-semibold", isFull ? "text-red-500" : "text-green-600")}>
                {isFull ? "FULL" : `${event.maxParticipants - event.currentParticipants} spots left`}
              </span>
            </div>
            <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all"
                style={{ width: `${fillPercent}%` }} />
            </div>
          </CardContent>
        </Card>

        {/* Description */}
        <Card className="shadow-sm border-0 mb-5">
          <CardContent className="p-5">
            <h3 className="font-semibold text-gray-800 mb-2">About This Event</h3>
            <p className="text-gray-600 text-sm leading-relaxed">{event.description}</p>
            {event.requiredMaterials && (
              <div className="mt-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Required Materials</p>
                <p className="text-sm text-gray-600">{event.requiredMaterials}</p>
              </div>
            )}
            {event.organizerNotes && (
              <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-xs font-semibold text-amber-700 mb-1">📌 Organizer Notes</p>
                <p className="text-sm text-amber-700">{event.organizerNotes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Map link */}
        <Card className="shadow-sm border-0 mb-5">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-800 mb-1 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-green-600" /> Event Location
                </h3>
                <p className="text-sm text-gray-500">{event.locationName}</p>
                <p className="text-xs text-gray-400">{event.latitude?.toFixed(5)}, {event.longitude?.toFixed(5)}</p>
              </div>
              <a href={`https://www.openstreetmap.org/?mlat=${event.latitude}&mlon=${event.longitude}#map=16/${event.latitude}/${event.longitude}`}
                target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm" className="border-green-300 text-green-700 hover:bg-green-50">
                  <MapPin className="mr-1 h-3 w-3" /> View on Map
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Action buttons */}
        {user && (
          <Card className="shadow-sm border-0 mb-8">
            <CardContent className="p-5 space-y-3">
              {participationStatus === "NOT_REGISTERED" && (
                <Button onClick={handleJoin} disabled={actionLoading || isFull}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white h-11">
                  {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isFull ? "Event Full" : "🌿 Join This Event (+10 Eco Points)"}
                </Button>
              )}

              {participationStatus === "REGISTERED" && (
                <>
                  <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2.5 rounded-lg text-sm font-medium">
                    <CheckCircle2 className="h-4 w-4" /> You are registered for this event
                  </div>
                  <Button
                    onClick={handleGpsAttendance}
                    disabled={gpsLoading || !canVerifyAttendance}
                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white h-11 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {gpsLoading ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Getting GPS...</>
                    ) : canVerifyAttendance ? (
                      <><Navigation className="mr-2 h-4 w-4" /> Verify Attendance via GPS (+{event.rewardPoints} pts)</>
                    ) : (
                      <><Clock className="mr-2 h-4 w-4" /> Attendance verification opens during the event</>
                    )}
                  </Button>
                  {attendanceClosed && (
                    <p className="text-xs text-gray-500 px-1">
                      You can verify attendance only on the event date and within the scheduled time.
                    </p>
                  )}
                  <Button onClick={handleCancel} disabled={actionLoading} variant="outline"
                    className="w-full border-red-200 text-red-500 hover:bg-red-50">
                    Cancel Registration
                  </Button>
                </>
              )}

              {participationStatus === "ATTENDED" && (
                <div className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl">
                  <CheckCircle2 className="h-6 w-6 text-green-600 shrink-0" />
                  <div>
                    <p className="font-semibold">Attendance Verified! 🎉</p>
                    <p className="text-xs">Eco Points have been awarded to your account.</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default EventDetailsPage;
