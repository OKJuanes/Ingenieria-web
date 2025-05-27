package com.example.ProyectoWeb.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import lombok.Data;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Data
@Entity
@Table(name = "evento")
public class Evento {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String nombre;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoEvento tipo;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd-MM-yyy")
    @Temporal(TemporalType.TIMESTAMP)
    private Date fecha;

    @Column(nullable = false, unique = false)
    private String empresa;

    @Column(length = 500)
    private String descripcion;

    // Participantes (usuarios inscritos)
    @ManyToMany
    @JoinTable(
            name = "evento_usuario",
            joinColumns = @JoinColumn(name = "evento_id"),
            inverseJoinColumns = @JoinColumn(name = "usuario_id")
    )
    private List<Usuario> participantes = new ArrayList<>();

    public List<String> getParticipantes() {
        return this.participantes.stream().map(Usuario::getUsername).toList();
    }
    
    public void addParticipante(Usuario usuario){
        this.participantes.add(usuario);
    }
    
    public void removeParticipante(Usuario usuario){
        this.participantes.remove(usuario);
    }

    // Invitados externos
    @OneToMany(mappedBy = "evento", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<InvitadoExterno> invitadosExternos = new ArrayList<>();

    public List<String> getInvitadosExternos() {
        return this.invitadosExternos.stream()
            .map(invitado -> invitado.getNombre() + " " + invitado.getApellido())
            .collect(Collectors.toList());
    }

    public void addInvitadoExterno(InvitadoExterno invitado) {
        invitado.setEvento(this);
        this.invitadosExternos.add(invitado);
    }

    public void removeInvitadoExterno(InvitadoExterno invitado) {
        this.invitadosExternos.remove(invitado);
        invitado.setEvento(null);
    }

    // Cantidad de participantes calculada dinámicamente
    @Transient
    public int getCantidadParticipantes() {
        return this.participantes.size();
    }
}
