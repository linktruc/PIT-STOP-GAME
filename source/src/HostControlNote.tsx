export default function HostControlNote({host,stage}:{host:boolean;stage:'ready'|'replay'}){
 return <p className="host-control-note" data-host={host?'true':'false'}>{host?'You are the host.':stage==='ready'?'Only the host can start the round.':'Only the host can choose Play again.'}</p>;
}
