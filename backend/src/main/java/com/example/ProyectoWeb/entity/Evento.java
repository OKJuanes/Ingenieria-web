package com.example.ProyectoWeb.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import lombok.Data;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

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

    // Invitados (para uso futuro)
    @ManyToMany
    @JoinTable(
            name = "evento_Invitado",
            joinColumns = @JoinColumn(name = "evento_id"),
            inverseJoinColumns = @JoinColumn(name = "usuario_id")
    )
    private List<Usuario> invitados = new ArrayList<>();

    public List<String> getInvitados() {
        return this.invitados.stream().map(Usuario::getUsername).toList();
    }
    public void addInvitado(Usuario usuario){
        this.invitados.add(usuario);
    }
    public void removeInvitado(Usuario usuario){
        this.invitados.remove(usuario);
    }

    // Participantes (usuarios inscritos)
    @ManyToMany
    @JoinTable(
            name = "evento_usuario", // <-- Aquí el nombre correcto de la tabla intermedia
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

    // Invitados externos (para uso futuro)
    @ManyToMany
    @JoinTable(
            name = "evento_Externo",
            joinColumns = @JoinColumn(name = "evento_id"),
            inverseJoinColumns = @JoinColumn(name = "InvitadoExterno_id")
    )
    private List<InvitadoExterno> invitadosExternos = new ArrayList<>();

    public List<String> getInvitadosExternos() {
        return this.invitadosExternos.stream().map(InvitadoExterno::getNombre).toList();
    }
    public void addInvitadosExternos(InvitadoExterno usuario){
        this.invitadosExternos.add(usuario);
    }
    public void removeInvitadosExternos(InvitadoExterno usuario){
        this.invitadosExternos.remove(usuario);
    }

    // Cantidad de participantes calculada dinámicamente
    @Transient
    public int getCantidadParticipantes() {
        return this.participantes.size();
    }
}
