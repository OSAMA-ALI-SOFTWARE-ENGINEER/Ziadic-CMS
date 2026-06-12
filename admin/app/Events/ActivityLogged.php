<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Broadcasting\ShouldBroadcast;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Queue\SerializesModels;

class ActivityLogged implements ShouldBroadcastNow
{
    use InteractsWithSockets, SerializesModels;

    public $payload;

    public function __construct(array $payload)
    {
        $this->payload = $payload;
    }

    public function broadcastOn()
    {
        return new Channel('activity-logs');
    }

    public function broadcastWith()
    {
        return $this->payload;
    }
}
